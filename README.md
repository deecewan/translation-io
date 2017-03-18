# translation-io

> An unofficial implementation to sync your translations with translation.io.

## Getting Started

- First, create a project on [translation.io](https://translation.io) to store your translations
- Run `yarn add -D translation-io` or `npm install --save-dev translation-io`
- Create a `.translaterc` containing, at minimum, your [translation.io](https://translation.io) API key for the project
  - You can alternatively use environment variables or CLI flags to set these options if you don't want *another* `.*rc` file
- From your project root, run `./node_modules/.bin/translate init`.  This will set up your project and send your initial translation keys to the server
- Any time you want to update your translations, run `./node_modules/.bin/translate sync` (`sync` is the default, so optional).  This will send all your new keys to the server, and update your locale files with any translations on the server.
- You can use these keys however you like.  They're a simple JSON file, with the key being the `id` and the value being the translation.

## Config

The following options are available for configuration.  You can set these via the commandline, via `.translaterc` or via environment variables (when running the CLI).

## Command Line

The entire program is configurable thanks to the amazing [yargs](http://yargs.js.org).  The only required field is `-k` or `--apiKey` to provide the API key.  This can also be included in your `.translaterc` config if your prefer.  If you're using this plugin inside your CI/CD environment to sync your translations during your build step, you can also configure everything via an environment variable.  For envvar support, just add `TRANSLATION` to the front of the prop.  For instance, `TRANSLATION_DEBUG=true` <=> `-v` <=> `--debug` <=> `{ "debug": true }` in a `.translaterc`.  For configuration options that are camelCase, the associated envvar is `TRANSLATION_CAMEL_CASE`.

## API

The functions behind the CLI are exposed in the module, but are still kind of up in the air right now.

You can import the `init` and `sync` command and run them programmatically.  The helpers deeper down can also be imported, but aren't in any way in their final form.  `init` and `sync` return `Promise<void>`, so you can call them programatically.

```js
import { init } from 'translation-io';

const config = { apiKey: 'your-api-key' };
init(config)
  .then(() => console.log('project initialised'));
```

Be aware that both the `init` and `sync` functions are quite noisy. Once there is a more stable API, I'd recommend not using the CLI functions and using the commands underneath them.

Also note that the `.translaterc` and environment variables are ignored when using the library programmatically. You must pass in all configuration options.

## Caveats

- I use this with React and `react-intl`. It's fairly opinionated towards this workflow at the moment, because it tries to extract the translations that `babel-plugin-react-intl` into one big hash.
  - You can get around this by making your `messagesRoot` and `messagesSlug` point towards one big hash that contains all your keys/values
  - Maybe one day I'll make it a little less opinionated
- I use the `babel-plugin-react-intl` to extract all my messages with keys. Without this, you'll have to find some way to get your translation hashes out. That aspect is beyond the scope of this project. That also means that you will need to run `sync` *after* your `babel` build.

## Making it easier

- Add a script to your `package.json`. I use `translate:sync`, so I can run `yarn translate:sync` to get the translation data

## Helpful Projects

- [`react-intl-po`](https://github.com/evenchange4/react-intl-po) was a *huge* inspiration for the PO generation and a heavy influence on the code in `createPOTHeader.js` and the multiline comment handling in this project.  Check this out if you just need to generate PO files from `react-intl` extractions.  I had planned to use this as the base for this project, but they project didn't include a way to include `msgctxt` in the output.

## Licence

MIT Licence.  See [LICENCE]('./LICENCE') for full licence.
