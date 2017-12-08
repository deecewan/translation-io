/* @flow */

export type Options = {
  apiKey: string,
  messageKey?: string, // defaults to defaultMessage
  endpoint?: string, // defaults to 'https://translation.io/api'
  sourceLocale?: string, // defaults to en
  targetLocales?: Array<string>, // defaults to []
  appRoot: string,
  translationRoot?: string, // defaults to <appRoot>/translations
  localesRoot?: string, // defaults to <translationRoot>/gettext
  domain?: string, // defaults to app
  potPath?: string, // defaults to <localesRoot>/<domain>.pot
  messagesRoot?: string, // defaults to <appRoot>/build/messages
  messagesGlob?: string, // defaults to <messagesRoot>/**/*.json
  debug?: boolean, // default to false
  purge?: boolean, // this option only applies to sync.  defaults to false
  extension?: string,
}

export type EnforcedOptions = {
  apiKey: string, // must be provided
  messageKey: string, // defaults to defaultMessage
  endpoint: string, // defaults to 'https://translation.io/api'
  sourceLocale: string, // defaults to en
  targetLocales: Array<string>, // defaults to []
  appRoot: string, // defaults to ./
  translationRoot: string, // defaults to <appRoot>/translations
  localesRoot: string, // defaults to <translationRoot>/gettext
  domain: string, // defaults to app
  potPath: string, // defaults to <localesRoot>/<domain>.pot
  messagesRoot: string, // defaults to <appRoot>/build/messages
  messagesGlob: string, // defaults to <messagesRoot>/**/*.json
  debug: boolean,
  purge: boolean, // only applies to sync
  extension: string,
}

const defaultOpts: EnforcedOptions = {
  apiKey: '', // simple placeholder
  messageKey: 'defaultMessage',
  endpoint: 'https://translation.io/api',
  sourceLocale: 'en',
  targetLocales: [],
  appRoot: './',
  translationRoot: '<appRoot>/translations',
  localesRoot: '<translationRoot>/gettext',
  domain: 'app',
  potPath: '<localesRoot>/<domain>.pot',
  messagesRoot: '<appRoot>/build/messages',
  messagesGlob: '<messagesRoot>/**/*.json',
  debug: false,
  purge: false,
  extension: 'yml',
};

export default function defaults(providedOpts: Options): EnforcedOptions {
  const opts: EnforcedOptions = {
    ...defaultOpts,
    ...providedOpts,
  };

  const replacer: (match: string, group: string) => string = (match, group) => opts[group] || match;

  const performReplacement: (n: string) => string = n => n.replace(/<(\w+)>/g, replacer);

  const doReplace: (n: any) => any = function (n) { return typeof n === 'string' ? performReplacement(n) : n; };

  function replaceAll(count = 0) {
    if (count > 12) throw new Error('Have you misspelled an angle bracket key? Too many iterations');
    const newCount = count + 1;
    const entries = Object.entries(opts).filter(opt => typeof opt[1] === 'string' && /<(\w+)>/g.test(opt[1]));
    if (entries.length === 0) {
      return;
    }
    entries.forEach(([key, value]) => {
      const newVal = doReplace(value);
      opts[key] = newVal;
    });
    replaceAll(newCount);
  }
  replaceAll();
  return opts;
}
