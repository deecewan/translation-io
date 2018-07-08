type config = {
  apiKey: string,
  messages: string,
  sourceLocale: string,
  targetLocales: array(string),
  output: string,
};

let parse = json =>
  Json.Decode.{
    apiKey: json |> field("apiKey", string),
    messages: json |> field("messages", string),
    sourceLocale: json |> field("sourceLocale", string),
    targetLocales: json |> field("targetLocales", array(string)),
    output: json |> field("output", string),
  };

let load = (filename: option(string)) => {
  let path =
    switch (filename) {
    | Some(name) => name
    | None => Node.Process.cwd() ++ Filename.dir_sep ++ ".translaterc.json"
    };
  Node.Fs.readFileAsUtf8Sync(path) |> Js.Json.parseExn |> parse;
};
