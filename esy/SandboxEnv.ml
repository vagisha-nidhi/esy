type t = BuildManifest.Env.t

let empty = BuildManifest.Env.empty

module OfPackageJson = struct
  type esy = {
    sandboxEnv : BuildManifest.Env.t [@default BuildManifest.Env.empty];
  } [@@deriving of_yojson { strict = false }]

  type t = {
    esy : esy [@default {sandboxEnv = BuildManifest.Env.empty}]
  } [@@deriving of_yojson { strict = false }]

end

let ofSandbox spec =
  let open RunAsync.Syntax in
  match spec.EsyInstall.SandboxSpec.manifest with

  | EsyInstall.ManifestSpec.One (EsyInstall.ManifestSpec.Filename.Esy, filename) ->
    let%bind json = Fs.readJsonFile Path.(spec.path / filename) in
    let%bind pkgJson = RunAsync.ofRun (Json.parseJsonWith OfPackageJson.of_yojson json) in
    return pkgJson.OfPackageJson.esy.sandboxEnv

  | EsyInstall.ManifestSpec.One (EsyInstall.ManifestSpec.Filename.Opam, _)
  | EsyInstall.ManifestSpec.ManyOpam ->
    return BuildManifest.Env.empty
