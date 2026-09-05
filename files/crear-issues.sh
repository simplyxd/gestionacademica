#!/usr/bin/env bash
# ============================================================
# Carga el backlog en GitHub Issues y lo agrega al Project.
#
# ES IDEMPOTENTE: se puede correr las veces que haga falta.
# Antes de crear cada tarjeta revisa si ya existe una con el
# mismo titulo y la saltea. Si un intento anterior fallo a la
# mitad, volve a correrlo y sigue donde quedo.
#
# Requisitos:
#   gh instalado -> https://cli.github.com
#   gh auth login
#   gh auth refresh -s project     <-- IMPRESCINDIBLE para Projects
#
# Uso:
#   ./crear-issues.sh
# ============================================================

set -euo pipefail

REPO="${1:-simplyxd/gestionacademica}"
OWNER="${REPO%%/*}"
PROJECT_NUM="${2:-1}"
CSV="issues-sga.csv"

[[ -f "$CSV" ]] || { echo "No encuentro $CSV en esta carpeta"; exit 1; }

# --- Verificar scope de Projects antes de hacer nada -------
if ! gh auth status 2>&1 | grep -q "project"; then
  echo "Falta el scope 'project' en tu token."
  echo "Corré esto y volvé a intentar:"
  echo "    gh auth refresh -s project"
  exit 1
fi

# --- Verificar que el Project exista -----------------------
if ! gh project view "$PROJECT_NUM" --owner "$OWNER" >/dev/null 2>&1; then
  echo "No encuentro el Project $PROJECT_NUM de $OWNER."
  echo "Tus projects disponibles:"
  gh project list --owner "$OWNER"
  exit 1
fi
echo "==> Project $PROJECT_NUM de $OWNER: ok"

# --- Labels ------------------------------------------------
echo "==> Creando labels"
crear_label () { gh label create "$1" --repo "$REPO" --color "$2" --force >/dev/null 2>&1 || true; }

for e in E0 E1 E2 E3 E4 E5 E6 E7 E8 E9 E10 E11; do
  crear_label "epic:$e" "1D76DB"
done
crear_label "wireframe"    "C5DEF5"
crear_label "modelo-datos" "5319E7"
crear_label "backend"      "0E8A16"
crear_label "frontend"     "FBCA04"
crear_label "integracion"  "D93F0B"
crear_label "docs"         "BFD4F2"

# --- Milestones --------------------------------------------
echo "==> Creando milestones"
for s in 1 2 3 4 5; do
  gh api "repos/$REPO/milestones" -f title="Sprint $s" >/dev/null 2>&1 || true
done

# --- Issues ------------------------------------------------
echo "==> Creando issues"
python3 - "$REPO" "$OWNER" "$PROJECT_NUM" <<'PY'
import csv, json, subprocess, sys

repo, owner, project = sys.argv[1], sys.argv[2], sys.argv[3]

# Titulos que ya existen en el repo, para no duplicar.
existentes = set()
r = subprocess.run(
    ["gh", "issue", "list", "--repo", repo, "--state", "all",
     "--limit", "500", "--json", "title"],
    capture_output=True, text=True)
if r.returncode == 0:
    existentes = {i["title"] for i in json.loads(r.stdout)}
    print(f"    {len(existentes)} issues ya existen en el repo\n")

with open("issues-sga.csv", encoding="utf-8") as f:
    filas = list(csv.DictReader(f))

creadas = saltadas = fallidas = 0

for i, fila in enumerate(filas, 1):
    titulo = fila["title"]
    etq = f"[{i:>2}/{len(filas)}] {titulo[:52]:<52}"

    if titulo in existentes:
        print(f"  {etq} ya existe, salteo")
        saltadas += 1
        continue

    # 1) Crear la issue (sin --project: se agrega despues)
    r = subprocess.run(
        ["gh", "issue", "create", "--repo", repo,
         "--title", titulo, "--body", fila["body"],
         "--label", fila["labels"], "--milestone", fila["milestone"]],
        capture_output=True, text=True)

    if r.returncode != 0:
        print(f"  {etq} FALLO: {r.stderr.strip()[:70]}")
        fallidas += 1
        continue

    url = r.stdout.strip().splitlines()[-1]

    # 2) Agregarla al Project (por numero, que aca si funciona)
    r2 = subprocess.run(
        ["gh", "project", "item-add", project, "--owner", owner, "--url", url],
        capture_output=True, text=True)

    if r2.returncode == 0:
        print(f"  {etq} ok")
    else:
        print(f"  {etq} creada, pero no entro al project: {r2.stderr.strip()[:50]}")
    creadas += 1

print(f"\n  Creadas: {creadas}   Salteadas: {saltadas}   Fallidas: {fallidas}")
PY

echo
echo "Listo. Revisá el board y repartí los épicos entre P1..P6."
