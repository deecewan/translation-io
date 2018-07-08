let fail = message => {
  Log.error(message);
  Node.Process.exit(1);
  failwith(message);
};

let po_generator = obj =>
  obj
  |> Js.Dict.entries
  |> Array.map(((k, v)) => "msgctxt \"" ++ k ++ "\"\nmsgid " ++ Js.Json.stringify(v) ++ "\nmsgstr \"\"\n")
  |> Array.fold_left((acc, str) => acc ++ "\n" ++ str, "");
