# Add Component Command

Fügt eine neue UI5 Web Component Card zum Projekt hinzu.

## Verwendung

```
/project:add-component timeline
/project:add-component shellbar
/project:add-component side-navigation
```

## Workflow

### Phase 1: Discovery (MUSS vor Implementation)

```bash
# 1. Prüfe ob Komponente existiert
COMPONENT="$ARGUMENTS"
echo "🔍 Suche nach: $COMPONENT"

# In Fiori-Package suchen
ls node_modules/@ui5/webcomponents-fiori/dist/ | grep -i "$COMPONENT"

# In Base-Package suchen  
ls node_modules/@ui5/webcomponents/dist/ | grep -i "$COMPONENT"
```

**STOP wenn nichts gefunden!** → Informiere User über verfügbare Komponenten.

### Phase 2: Implementation

Nur wenn Phase 1 erfolgreich:

1. **Import hinzufügen** in `src/ui5-loader.ts`:
   ```typescript
   import "@ui5/webcomponents-fiori/dist/<ComponentName>.js";
   ```

2. **Card erstellen** als `src/cards/ui5-<component>-card.ts`
   - Extends BaseUI5Card
   - Implementiert render()
   - Registriert mit customElements.define()

3. **Registrieren** in `src/index.ts`:
   ```typescript
   CARD_DEFINITIONS.push({
     type: "custom:ui5-<component>-card",
     name: "UI5 <Component> Card",
     description: "...",
     preview: false
   });
   ```

### Phase 3: Validation

```bash
# Build MUSS erfolgreich sein
npm run build

# Prüfe ob Bundle die neue Card enthält
grep -l "ui5-<component>-card" dist/ui5-webcomponents-ha.js
```

### Phase 4: Test Handoff

Nach erfolgreicher Validation:

```
→ Wechsle zu Test-Engineer Agent
→ Schreibe Tests für ui5-<component>-card
```

## Fehlerbehandlung

| Fehler | Aktion |
|--------|--------|
| Komponente nicht gefunden | Liste verfügbare Komponenten |
| Import-Fehler | Prüfe exakten Pfad in node_modules |
| Build-Fehler | Zeige Fehler, behebe vor Commit |
| TypeScript-Fehler | Prüfe Typen, ggf. any verwenden |

## Beispiel-Output

```markdown
## 🔍 Discovery: timeline

Gefunden in @ui5/webcomponents-fiori:
- Timeline.js
- TimelineItem.js

## 📦 Implementation

### Geänderte Dateien
1. `src/ui5-loader.ts`
   + import "@ui5/webcomponents-fiori/dist/Timeline.js";
   + import "@ui5/webcomponents-fiori/dist/TimelineItem.js";

2. `src/cards/ui5-timeline-card.ts` (NEU)
   - UI5TimelineCard extends BaseUI5Card
   - Config: entity, items[], show_time

3. `src/index.ts`
   + CARD_DEFINITIONS.push({ type: "custom:ui5-timeline-card", ... })

### ✅ Build erfolgreich

### Nächster Schritt
Tests schreiben: `/project:add-tests timeline`
```

## Agent-Zuweisung

Dieser Command verwendet: `ui5-ha-component-engineer`
