# 🚀 Deployment Guide - Car Listing App

## Možnosti nasazení ZDARMA

### ⭐ Doporučeno: Render.com

Render nabízí free tier, který je ideální pro tento projekt:
- ✅ 750 hodin zdarma měsíčně
- ✅ PostgreSQL databáze zdarma
- ✅ Automatická SSL (HTTPS)
- ✅ Subdoména zdarma (např. `car-listing.onrender.com`)
- ✅ Automatické deploymenty z GitHubu

---

## 📝 Postup nasazení na Render.com

### 1. Příprava projektu

```bash
# Inicializujte Git repozitář
git init
git add .
git commit -m "Initial commit"

# Vytvořte repozitář na GitHubu a pushněte
git remote add origin https://github.com/YOUR_USERNAME/car-listing-app.git
git push -u origin main
```

### 2. Registrace na Render

1. Jděte na https://render.com
2. Klikněte "Get Started for Free"
3. Přihlaste se přes GitHub

### 3. Vytvoření PostgreSQL databáze

1. V Render dashboardu klikněte "New +"
2. Vyberte "PostgreSQL"
3. Vyplňte:
   - **Name**: `car-listing-db`
   - **Database**: `carlistingdb`
   - **User**: `caruser`
   - **Region**: vyberte nejbližší (Frankfurt pro Evropu)
   - **Plan**: FREE
4. Klikněte "Create Database"
5. **Důležité**: Zkopírujte si "Internal Database URL" - budete ji potřebovat!

### 4. Nasazení Backendu

1. Klikněte "New +" → "Web Service"
2. Vyberte "Build and deploy from a Git repository"
3. Připojte váš GitHub repozitář
4. Nastavte:
   - **Name**: `car-listing-backend`
   - **Region**: stejná jako databáze
   - **Root Directory**: `backend`
   - **Environment**: `Docker`
   - **Plan**: FREE
   - **Build Command**: (prázdné - použije Dockerfile)
   - **Start Command**: `npm run dev`

5. **Environment Variables** - přidejte:
   ```
   NODE_ENV=production
   DATABASE_URL=[zkopírujte Internal Database URL z kroku 3]
   JWT_SECRET=[vygenerujte náhodný string, např: aB3xK9mP2nQ8rT5vW7yZ4cD6fG]
   JWT_EXPIRES_IN=7d
   PORT=5000
   ```

6. Klikněte "Create Web Service"

### 5. Nasazení Frontendu

**DOPORUČENO: Static Site** (rychlejší a šetří free tier)

1. Klikněte "New +" → "Static Site"
2. Vyberte váš GitHub repozitář
3. Nastavte:
   - **Name**: `car-listing-frontend`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `build`

4. **Environment Variables** - přidejte:
   ```
   REACT_APP_API_URL=https://car-listing-backend.onrender.com/api
   ```
   (nahraďte URL za skutečnou URL vašeho backendu)

5. Klikněte "Create Static Site"

**ALTERNATIVA: Web Service** (pokud potřebujete dynamický server)

Pokud chcete použít Web Service místo Static Site:

1. Klikněte "New +" → "Web Service"
2. Vyberte váš GitHub repozitář
3. Nastavte:
   - **Name**: `car-listing-frontend`
   - **Region**: stejná jako backend
   - **Root Directory**: `frontend`
   - **Environment**: `Docker`
   - **Plan**: FREE

4. **Environment Variables**:
   ```
   REACT_APP_API_URL=https://car-listing-backend.onrender.com/api
   PORT=3000
   ```

5. Render automaticky použije port 3000 z Dockerfile
6. Klikněte "Create Web Service"

### 6. Testování

Vaše aplikace je nyní live na:
- **Frontend**: `https://car-listing-frontend.onrender.com`
- **Backend API**: `https://car-listing-backend.onrender.com`
- **Swagger docs**: `https://car-listing-backend.onrender.com/api-docs`

**Poznámka:** Migrace se spouštějí automaticky při každém deployi backendu, takže není potřeba nic dělat ručně!

---

## 🔧 Důležité poznámky

### Free tier omezení:
- ⚠️ Služby na free tieru "usínají" po 15 minutách nečinnosti
- První request po probuzení může trvat 30-60 sekund
- 750 hodin/měsíc (cca 31 dní)
- Databáze: 1GB storage, 97 hodin runtime/měsíc

### Tipy:
- Backend i frontend se nasazují samostatně jako 2 služby
- Databáze běží jako 3. služba
- Vždy používejte "Internal Database URL" pro spojení backendu s DB
- Po každé změně kódu se automaticky znovu nasadí

---

## 🌐 Alternativní možnosti

### Railway.app
- Free tier: $5 credit/měsíc (~500 hodin)
- Jednodušší setup, ale méně hodin zdarma
- https://railway.app

### Fly.io
- Free tier: 3 VMs s 256MB RAM
- Trochu složitější na setup
- https://fly.io

### Vercel (pouze pro frontend)
- Frontend byste mohli dát na Vercel zdarma
- Backend a DB by musely být jinde
- https://vercel.com

---

## 🆘 Troubleshooting

### Backend se nemůže připojit k databázi
- Zkontrolujte, že používáte "Internal Database URL"
- Ověřte, že všechny služby jsou ve stejné regionu

### Frontend nemůže volat API
- **Nejčastější problém**: Environment variable nebyla nastavená při buildu
- **Řešení**:
  1. V Render dashboardu zkontrolujte Environment variables
  2. Ujistěte se, že `REACT_APP_API_URL` je nastavená
  3. Klikněte "Manual Deploy" → "Clear build cache & deploy"
  4. Nebo pushněte prázdný commit: `git commit --allow-empty -m "Rebuild" && git push`
- Zkontrolujte `REACT_APP_API_URL` proměnnou (musí začínat `REACT_APP_`)
- Ujistěte se, že backend běží
- Zkontrolujte CORS nastavení v backendu
- Otevřete Developer Console v prohlížeči (F12) a podívejte se na chyby

### Migrace nefungují
- Migrace se spouštějí automaticky při startu backendu
- Zkontrolujte logy backendu: `docker-compose logs backend` nebo v Render dashboardu
- Ujistěte se, že `DATABASE_URL` je správně nastavená
- Pokud stále nefungují, můžete je spustit ručně přes Render Shell (v placené verzi)

---

## 💡 Vylepšení pro produkci

Pro skutečnou produkci zvažte:
1. **Vlastní doménu** - Render umožňuje připojit vlastní doménu zdarma
2. **Build optimalizace** - použijte `npm run build` pro produkční build
3. **Environment variables** - nikdy necommitujte secrets do Gitu
4. **Monitoring** - Render má vestavěné logy a metrics
5. **Backupy** - pravidelně zálohujte databázi

---

## 📚 Další zdroje

- [Render Documentation](https://render.com/docs)
- [Prisma Deployment Guide](https://www.prisma.io/docs/guides/deployment)
- [React Deployment](https://create-react-app.dev/docs/deployment/)
