let read = file => Node.Fs.readFileAsUtf8Sync(file);
let write = (name, content) => Node.Fs.writeFileAsUtf8Sync(name, content);

let load = glob => {
  let files = Glob.sync(glob);

  Array.map(
    file =>
      file
      |> read
      |> Js.Json.parseExn
      |> Js.Json.decodeObject
      |> (
        x =>
          switch (x) {
          | Some(obj) => obj
          | None =>
            Util.fail(
              "Translations must be plain JSON objects. See `" ++ file ++ "`.",
            )
          }
      ),
    files,
  );
};

let build_complete = objects => {
  let dict = Js.Dict.empty();
  objects
  |> Array.iter(obj =>
       obj
       |> Js.Dict.entries
       |> Array.iter(((k, v)) => {
            let existing = Js.Dict.get(dict, k);
            switch (existing) {
            | Some(duplicate) =>
              Log.warn(
                "Duplicate key found! Key: "
                ++ k
                ++ ". Values: "
                ++ Js.Json.stringify(duplicate)
                ++ ", "
                ++ Js.Json.stringify(v)
                ++ ".",
              )
            | None => ()
            };
            switch (Js.Json.decodeString(v)) {
            | Some(_) => Js.Dict.set(dict, k, v)
            | None =>
              Log.warn(
                "Translation value is not a string! Key: "
                ++ k
                ++ " has value `"
                ++ Js.Json.stringify(v)
                ++ "`",
              )
            };
          })
     );

  /* return */ dict;
};

let translations_as_string = glob => {
  let r = glob
  |> load
  |> build_complete;

  Js.log(Util.po_generator(r));

  r
  |> Js.Json.object_
  |> Js.Json.stringifyWithSpace(_, 2);
};

let write_files = (directory, locales, messages) =>
  locales
  |> Array.map(locale =>
       directory ++ Filename.dir_sep ++ "translation." ++ locale ++ ".json"
     )
  |> Array.iter(filename => write(filename, messages));

let run = (config: Config.config) => {
  let output = translations_as_string(config.messages);

  write_files(
    config.output,
    Array.concat([[|config.sourceLocale|], config.targetLocales]),
    output,
  );
};
