# FLATLINE — Sistema para Foundry VTT

> *"2099. As corporações compraram o Estado. O Estado vendeu o povo. O povo aprendeu a fazer corres."*

Sistema oficial do RPG **FLATLINE** para [Foundry VTT](https://foundryvtt.com/) v13+.  
Cyberpunk brasileiro. Year Zero Engine.

---

## Instalação

### Via Foundry (recomendado)

1. Abra o Foundry VTT
2. Vá em **Game Systems → Install System**
3. Cole no campo **Manifest URL**:

```
https://raw.githubusercontent.com/dirodgit/flatline-foundry-vtt/main/dist/system.json
```

4. Clique **Install**

### Manual

Baixe o `.zip` da [página de Releases](../../releases/latest), extraia na pasta `systems/flatline/` do seu Foundry.

---

## Funcionalidades (v0.1.x)

### ✅ Implementado
- **Ficha do Corredor** completa — 5 abas (Stats, Combate, Inventário, Holomancia, Bio)
- **4 Atributos** (Força, Agilidade, Astúcia, Empatia) com escala de dados D6/D8/D10/D12
- **14 Perícias** mapeadas por atributo, com marcação de uso (XP)
- **Sistema de rolagem YZE** — Atributo + Perícia + Equipamento, resultado 6+ = sucesso, 10+ = duplo sucesso
- **Forçar rolagem** — re-rola dados, gera Condições por glitches, +1 RAM
- **Condições Físicas e Mentais** — 3 graus com rótulos narrativos obrigatórios
- **Estado Quebrado** — automático ao acumular 4 condições do mesmo tipo
- **Trilha de Degradação** — 0–12, com dado escalando de D6 a D12
- **RAM** — recurso de cyberware/holomancia com trilha visual, Limiar e custo por ultrapassar
- **CRED / REP / XP** — rastreados na aba Bio
- **9 Arquétipos** — Mercenário, Negociante, Holomante, Técnico, Piloto, Policial, Executivo, Influencer, Médico
- **7 tipos de Item** — Arma, Armadura, Cyberware, Programa, Especialidade, Equipamento, Lesão Crítica
- **Fichas de PNJ** (Ameaça) e Veículo
- **Chat cards** — rolagem com botão Forçar, itens, degradação
- **Idioma PT-BR** primário, EN como fallback

### 🔜 Próximas sprints
- Lesões Críticas com tabela D66 integrada
- Compêndios — armas, cyberware, programas, especialidades, PNJs
- Holomancia — disciplinas com níveis e execução de programas
- Combate — iniciativa por cartas, zonas, rastreamento automático
- Veículos — perseguições, dano, Confiabilidade
- CRED — rolagem de aquisição, mercado de beco
- Macros — Dado de Degradação, tabela de Lesões

---

## Desenvolvimento local

```bash
git clone https://github.com/dirodgit/flatline-foundry-vtt.git
cd flatline-foundry-vtt
npm install

# Build único
npm run build
node tools/bundle.mjs

# Watch (rebuilda ao salvar)
npm run build:watch
```

### Estrutura do projeto

```
flatline-foundry-vtt/
├── src/                  # Código-fonte
│   ├── flatline.js       # Entry point
│   ├── flatline.scss     # Estilos
│   ├── system/           # config, constants, handlebars, settings
│   ├── actor/            # Documents e sheets de Actor
│   ├── item/             # Documents e sheets de Item
│   ├── components/       # Roll engine, chat cards
│   └── lang/             # Fonte das traduções (YML)
├── static/               # Arquivos copiados direto para dist/
│   ├── system.json
│   ├── template.json
│   └── lang/             # JSON compilados das traduções
├── dist/                 # Build de saída (comittado)
├── tools/                # Scripts de bundle e release
└── .github/workflows/    # CI/CD automático
```

### Publicando uma nova versão

```bash
# 1. Atualize version em static/system.json
# 2. Atualize CHANGELOG.md
# 3. Commit e tag
git add .
git commit -m "release: v0.2.0"
git tag v0.2.0
git push origin main --tags

# → GitHub Actions faz o resto:
#   build → bundle → cria Release → anexa zip → atualiza dist/system.json
```

---

## Licença

Código: **GPL-3.0-or-later**  
Conteúdo do RPG FLATLINE: baseado no **Year Zero Engine SRD** (CC-BY 4.0 — Free League Publishing)

---

## Créditos

- Sistema FLATLINE criado por [você]
- Implementação Foundry VTT pela comunidade FLATLINE
- Referência de arquitetura: [Blade Runner RPG para Foundry](https://github.com/fvtt-fria-ligan/blade-runner-foundry-vtt) (GPL-3.0)
