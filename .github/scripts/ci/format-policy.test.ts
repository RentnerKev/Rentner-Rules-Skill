import { describe, expect, test } from 'bun:test'
import {
    mkdtempSync,
    mkdirSync,
    readFileSync,
    rmSync,
    writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { basename, dirname, join, resolve } from 'node:path'

const policy = readFileSync(
    new URL('../../../references/typescript/tooling.md', import.meta.url),
    'utf8',
).replace(/\r\n/g, '\n')

function example(language: string) {
    const block = policy.split('```' + language + '\n')[1]?.split('```')[0]
    if (!block) throw new Error('Missing formatter example for ' + language)
    return block
}

const manifest = example('json')
const configuration = example('toml')
const unformatted =
    'export const settings={\nmessage:"Gude Rentner",\ntools:["bun","oxlint","rustfmt"]\n};\n'
const formatted = [
    'export const settings = {',
    "    message: 'Gude Rentner',",
    "    tools: ['bun', 'oxlint', 'rustfmt'],",
    '}',
    '',
].join('\n')

function fixture(check: (directory: string) => void) {
    const parent = resolve(tmpdir())
    const directory = mkdtempSync(join(parent, 'rentner-format-policy-'))
    try {
        writeFileSync(join(directory, 'package.json'), manifest)
        writeFileSync(
            join(directory, 'bunfig.toml'),
            'env = false\n\n' + configuration,
        )
        mkdirSync(join(directory, 'src'))
        writeFileSync(join(directory, 'src', 'settings.ts'), unformatted)
        check(directory)
    } finally {
        if (
            dirname(directory) !== parent ||
            !basename(directory).startsWith('rentner-format-policy-')
        ) {
            throw new Error(
                'Refusing cleanup outside the owned temporary fixture',
            )
        }
        rmSync(directory, { recursive: true, force: true })
    }
}

function run(directory: string, script: string) {
    return Bun.spawnSync([process.execPath, '--no-env-file', 'run', script], {
        cwd: directory,
        stdout: 'pipe',
        stderr: 'pipe',
    })
}

describe('documented native Bun formatter', () => {
    test('check rejects formatting differences without writing', () => {
        fixture((directory) => {
            expect(run(directory, 'format:check').exitCode).toBe(1)
            expect(
                readFileSync(join(directory, 'src', 'settings.ts'), 'utf8'),
            ).toBe(unformatted)
        })
    })

    test('format applies the style and excludes synthetic generated files', () => {
        fixture((directory) => {
            const generated = join(directory, 'src', 'generated', 'nested')
            mkdirSync(generated, { recursive: true })
            const sentinel = 'export const = // synthetic protected fixture\n'
            const protectedFiles = [
                join(generated, 'binding.ts'),
                join(directory, 'src', 'routeTree.gen.ts'),
                join(directory, 'src', 'binding.generated.ts'),
            ]
            for (const file of protectedFiles) writeFileSync(file, sentinel)

            const result = run(directory, 'format')
            expect(result.stderr.toString()).not.toContain('error:')
            expect(result.exitCode).toBe(0)
            expect(
                readFileSync(join(directory, 'src', 'settings.ts'), 'utf8'),
            ).toBe(formatted)
            for (const file of protectedFiles)
                expect(readFileSync(file, 'utf8')).toBe(sentinel)
            expect(run(directory, 'format:check').exitCode).toBe(0)
        })
    })

    test('check reports invalid owned source as an error without writing', () => {
        fixture((directory) => {
            const invalid = 'export const =\n'
            const source = join(directory, 'src', 'settings.ts')
            writeFileSync(source, invalid)
            expect(run(directory, 'format:check').exitCode).toBe(2)
            expect(readFileSync(source, 'utf8')).toBe(invalid)
        })
    })

    test('protected path patterns cover root and nested paths without accessing them', () => {
        const { fmt } = Bun.TOML.parse(configuration)
        const ignores = fmt.ignorePatterns.map(
            (pattern: string) => new Bun.Glob(pattern),
        )
        const paths = [
            'drizzle',
            'drizzle/entry.sql',
            'src/drizzle',
            'src/drizzle/meta/snapshot.json',
            '.env',
            'web/.env.production',
            'node_modules',
            'node_modules/package/index.ts',
            'web/node_modules/package/index.ts',
            'vendor',
            'vendor/package/index.ts',
            'core/target',
            'target/debug/output.json',
            'core/target/debug/output.json',
            'dist',
            'dist/index.js',
            'web/build',
            'web/build/index.js',
            'out',
            'out/index.js',
            'web/.output',
            'web/.output/index.js',
            'coverage',
            'coverage/report.json',
            'src/generated',
            'src/generated/binding.ts',
            'web/src/routeTree.gen.ts',
            'src/binding.generated.ts',
        ]
        for (const path of paths) {
            expect(ignores.some((ignore: Bun.Glob) => ignore.match(path))).toBe(
                true,
            )
        }
        expect(
            ignores.some((ignore: Bun.Glob) => ignore.match('src/settings.ts')),
        ).toBe(false)
    })
})
