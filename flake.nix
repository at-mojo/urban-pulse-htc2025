{
  description = "Urban Pulse - Next.js with Prisma";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
      in
      {
        packages.default = pkgs.writeShellScriptBin "urban-pulse" ''
          echo "Urban Pulse development commands:"
          echo "  dev    - Start development server"
          echo "  build  - Build the application"
          echo "  start  - Start production server"
          echo "  install - Install dependencies"
        '';

        packages.dev = pkgs.writeShellScriptBin "dev" ''
          nix run .#install
          ${pkgs.bun}/bin/bun run dev
        '';

        packages.build = pkgs.writeShellScriptBin "build" ''
          nix run .#install
          ${pkgs.bun}/bin/bun run build
        '';

        packages.start = pkgs.writeShellScriptBin "start" ''
          nix run .#install
          ${pkgs.bun}/bin/bun run start
        '';

        packages.install = pkgs.writeShellScriptBin "install" ''
          ${pkgs.bun}/bin/bun install
        '';

        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            nodejs_20
            openssl
            nodePackages.prisma
            nodePackages.typescript
            nodePackages.typescript-language-server
          ];

          shellHook = ''
            export PRISMA_SCHEMA_ENGINE_BINARY="${pkgs.prisma-engines}/bin/schema-engine"
            export PRISMA_QUERY_ENGINE_BINARY="${pkgs.prisma-engines}/bin/query-engine"
            export PRISMA_QUERY_ENGINE_LIBRARY="${pkgs.prisma-engines}/lib/libquery_engine.node"
            export PRISMA_FMT_BINARY="${pkgs.prisma-engines}/bin/prisma-fmt"
            export PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1

            nix run .#install
          '';
        };
      }
    );
}
