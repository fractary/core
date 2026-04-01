# Project Structure Discovery

Used when the prompt suggests discovery-based issue creation.

## Discovery Patterns

### Datasets / Data Files
```bash
find . -type f \( -name "*.csv" -o -name "*.json" -o -name "*.parquet" \) | head -20
ls -R datasets/ data/ 2>/dev/null
```
Extract: file names, schemas, data types.

### API Endpoints / Routes
```bash
grep -r "router\.\(get\|post\|put\|delete\|patch\)" src/ --include="*.ts" --include="*.js" -l
grep -r "@(Get|Post|Put|Delete|Patch)" src/ --include="*.ts" -l
```
Read matched files to extract endpoint definitions.

### Templates
```bash
find . -type f \( -name "*.hbs" -o -name "*.ejs" -o -name "*.html" -o -name "*.mustache" \) | head -20
ls -R templates/ 2>/dev/null
```

### General Structure
```bash
ls -la src/
find . -maxdepth 2 -type d | head -30
```

## After Discovery

1. Build list of items found
2. Filter: exclude items that already have issues (check via `gh issue list`)
3. Generate title/body for each using template or contextual generation
4. Return to creation-flow.md Step 2 (present plan)
