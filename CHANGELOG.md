Changelog

# [1.2.0](https://github.com/nuxtus/create-nuxtus/compare/v1.1.1...v1.2.0) (2022-08-24)


### Features

* :sparkles: can use any Directus compatible DB ([2cf83cf](https://github.com/nuxtus/create-nuxtus/commit/2cf83cff0bae259fbc5c4325804e1d120131864b))
* :sparkles: support for all Directus database clients ([3dda34d](https://github.com/nuxtus/create-nuxtus/commit/3dda34df242a173702d562cf7c5d63d62e99fade))
* :sparkles: using liquid templates for file population ([b13f9a4](https://github.com/nuxtus/create-nuxtus/commit/b13f9a40167c39701ce5ce6872db9e5977d1de39))

## [1.1.1](https://github.com/nuxtus/create-nuxtus/compare/v1.1.0...v1.1.1) (2022-08-11)


### Bug Fixes

* :bug: correctly remove .github folder ([300e91a](https://github.com/nuxtus/create-nuxtus/commit/300e91a44738af64ec012526501336638d0fb947))


### Performance Improvements

* :zap: remote CHANGELOG.md ([8ab385d](https://github.com/nuxtus/create-nuxtus/commit/8ab385d12adb78092c8c8da07eee3b6001d7160e))

# [1.1.0](https://github.com/nuxtus/create-nuxtus/compare/v1.0.6...v1.1.0) (2022-07-21)


### Features

* :sparkles: display default login after install ([531be88](https://github.com/nuxtus/create-nuxtus/commit/531be888f6e0ee21f5bac27199b4176efddb9946))


### Performance Improvements

* :zap: ask questions at beginning of script ([5f18894](https://github.com/nuxtus/create-nuxtus/commit/5f18894263f42375ffa4b03a550868b16e004eee))

# 1.0.6

- Remove /clients/interfaces/nuxtus.ts from gitignore on creation

# 1.0.5

- Prompt user to create flow to allow automatic creation of pages when collections are created

# 1.0.4

- Add npm start command on successful creation

# 1.0.3

- Fix issue where package.json should not be removed

# 1.0.2

- Execute as much in parallel as possible
- Make CLI output pretty
- Add branch to nuxtus git repo for easier debugging
- Prompt for database type
- Automatically create SQLite database
- Automatically start on successful install (if using SQLite)

# 1.0.1

- Put .env in client and server .gitignore files
- Add link to Github docs on successful install

# 1.0.0

- Initial release.
