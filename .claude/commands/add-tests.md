# Add Tests Command

Generiert Tests für eine bestehende UI5 Card.

## Verwendung

```
/project:add-tests timeline
/project:add-tests button --coverage full
```

## Voraussetzungen

- Card existiert bereits: `src/cards/ui5-<n>-card.ts`
- Card ist in `index.ts` registriert

## Workflow

### Step 1: Card analysieren

```bash
# Prüfe ob Card existiert
CARD="ui5-$1-card"
if [ ! -f "src/cards/$CARD.ts" ]; then
  echo "❌ Card nicht gefunden: src/cards/$CARD.ts"
  exit 1
fi

# Extrahiere Config-Interface
grep -A 20 "interface.*Config" "src/cards/$CARD.ts"
```

### Step 2: Test-Datei erstellen

Erstelle `src/cards/ui5-<n>-card.test.ts` mit:

1. **Initialization Tests**
   - Custom Element definiert
   - Shadow DOM vorhanden

2. **Configuration Tests**
   - Valide Config akzeptiert
   - Invalide Config wirft Error

3. **Rendering Tests**
   - UI5 Component wird gerendert
   - Entity-State wird angezeigt

4. **State Update Tests**
   - Re-render bei State-Änderung
   - Nur bei relevanten Änderungen

5. **Action Tests**
   - Tap-Action funktioniert
   - Hold-Action funktioniert

### Step 3: Tests ausführen

```bash
npm test -- --filter="$CARD"
```

## Test-Abdeckung (--coverage Flag)

| Level | Tests |
|-------|-------|
| basic | Init, Config, Render |
| full | + State, Actions, Edge Cases |
| complete | + Performance, Memory Leaks |

## Output Format

```markdown
## ✅ Tests erstellt: ui5-timeline-card

### Datei
`src/cards/ui5-timeline-card.test.ts`

### Test-Kategorien
- ✅ Initialization (2 Tests)
- ✅ Configuration (2 Tests)
- ✅ Rendering (3 Tests)
- ✅ State Updates (2 Tests)
- ✅ Actions (2 Tests)

### Ergebnis
```
npm test -- --filter="ui5-timeline-card"

 ✓ UI5TimelineCard (11 tests) 42ms
   ✓ Initialization
     ✓ should be defined as custom element
     ✓ should have shadow root
   ✓ Configuration
     ✓ should accept valid config
     ✓ should throw on invalid config
   ...
```

### Coverage
- Statements: 94%
- Branches: 88%
- Functions: 100%
- Lines: 93%

### Nächster Schritt
Validation: `/project:validate`
```

## Edge Cases die getestet werden

| Case | Test |
|------|------|
| Entity nicht vorhanden | Zeigt Fallback |
| Config null | Wirft Error |
| hass undefined | Rendert Loading |
| State undefined | Graceful handling |
| Schnelle Updates | Debouncing |

## Agent-Zuweisung

Dieser Command verwendet: `ui5-ha-test-engineer`
