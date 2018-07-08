type valid_subcommand =
  | Sync
  | Init
  | Extract;
let sub: ref(option(valid_subcommand)) = ref(None);
let verbose = ref(false);
let configPath: ref(option(string)) = ref(None);

let subcommand_parse = subcommand => {
  let set = t => sub := Some(t);

  switch (subcommand) {
  | "sync" => set(Sync)
  | "init" => set(Init)
  | "extract" => set(Extract)
  | _ => ()
  };
};

let speclist = [
  ("-V", Arg.Set(verbose), "Enable verbose mode"),
  ("--verbose", Arg.Set(verbose), "Enable verbose mode"),
  (
    "-c",
    Arg.String(s => configPath := Some(s)),
    "The config string to use",
  ),
  (
    "--config",
    Arg.String(s => configPath := Some(s)),
    "The config string to use",
  ),
];

Arg.parse(speclist, subcommand_parse, "Print a thing");

let config = Config.load(configPath^);

switch (sub^) {
| Some(a) =>
  switch (a) {
  | Sync => Sync.run(config)
  | Init => Init.run(config)
  | Extract => Extract.run(config)
  }
| None =>
  Js.log("You must choose a subcommand: sync,init,extract");
  Node.Process.exit(1);
  raise(Exit);
};
