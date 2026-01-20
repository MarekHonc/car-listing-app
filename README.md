# Car Listing Application

Fullstack aplikace pro správu automobilových inzerátů s autentizací uživatelů.

## Technologie

### Backend
- Node.js
- TypeScript
- Express.js
- PostgreSQL
- Prisma ORM
- JWT autentizace
- Swagger API dokumentace

### Frontend
- React
- TypeScript
- React Router
- Bootstrap 5
- React Bootstrap
- Axios

### DevOps
- Docker
- Docker Compose

## Funkce

- ✅ Registrace a přihlášení uživatelů (JWT)
- ✅ Správa značek automobilů (Car Brands)
- ✅ Správa modelů automobilů (Car Models)
- ✅ Vytváření, editace a mazání inzerátů
- ✅ Filtry podle značky, modelu a štítků
- ✅ Komentáře k inzerátům
- ✅ Štítky pro inzeráty
- ✅ Označení smazaných inzerátů
- ✅ Kompletní validace formulářů
- ✅ Swagger API dokumentace

## Instalace a spuštění

### Předpoklady
- Docker a Docker Compose

### Spuštění

1. Přejděte do složky projektu:
```bash
cd car-listing-app
```

2. Spusťte aplikaci pomocí Docker Compose:
```bash
docker-compose up --build
```

**Poznámka**: Backend se automaticky inicializuje - vygeneruje Prisma client a aplikuje migrace databáze. První spuštění může trvat 1-2 minuty.

3. Počkejte, až uvidíte v logu:
```
car-listing-backend  | 🚀 Server is running on http://localhost:5000
car-listing-backend  | 📚 API Documentation: http://localhost:5000/api-docs
car-listing-frontend | webpack compiled successfully
```

### Přístup k aplikaci

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Dokumentace (Swagger)**: http://localhost:5000/api-docs
- **Database**: localhost:5432

### Výchozí přihlašovací údaje

Aplikace nemá žádné výchozí uživatele. Registrujte se na stránce registrace.

## API Endpoints

### Autentizace
- `POST /api/auth/register` - Registrace nového uživatele
- `POST /api/auth/login` - Přihlášení uživatele

### Značky (Car Brands)
- `GET /api/carbrands` - Získat všechny značky
- `GET /api/carbrands/:id` - Získat značku podle ID
- `POST /api/carbrands` - Vytvořit novou značku
- `PUT /api/carbrands/:id` - Aktualizovat značku
- `DELETE /api/carbrands/:id` - Smazat značku

### Modely (Car Models)
- `GET /api/carmodels` - Získat všechny modely
- `GET /api/carmodels/:id` - Získat model podle ID
- `POST /api/carmodels` - Vytvořit nový model
- `PUT /api/carmodels/:id` - Aktualizovat model
- `DELETE /api/carmodels/:id` - Smazat model

### Inzeráty (Listings)
- `GET /api/listings` - Získat všechny inzeráty (s filtry)
- `GET /api/listings/:id` - Získat detail inzerátu
- `POST /api/listings` - Vytvořit nový inzerát
- `PUT /api/listings/:id` - Aktualizovat inzerát
- `DELETE /api/listings/:id` - Smazat inzerát

### Komentáře (Comments)
- `POST /api/comments` - Přidat komentář
- `PUT /api/comments/:id` - Upravit komentář
- `DELETE /api/comments/:id` - Smazat komentář

### Štítky (Tags)
- `GET /api/tags` - Získat všechny štítky
- `POST /api/tags` - Vytvořit nový štítek
- `POST /api/tags/listing` - Přidat štítek k inzerátu
- `DELETE /api/tags/:tagId/listing/:listingId` - Odebrat štítek z inzerátu

## Databázová struktura

### User
- id (PK)
- name
- password (hashed)
- createdAt

### CarBrand
- id (PK)
- name (unique)

### CarModel
- id (PK)
- name
- carBrandId (FK)
- engine
- power (kW)

### Listing
- id (PK)
- name
- price
- link
- imageLink
- addedByUserId (FK)
- isDeleted
- carModelId (FK, optional)
- createdAt
- modifiedAt

### Comment
- id (PK)
- text
- date
- listingId (FK)
- addedByUserId (FK)

### Tag
- id (PK)
- name (unique)
- color

### TagToListing
- tagId (FK)
- listingId (FK)
- userId (FK)

## Vývoj

### Backend development
```bash
cd backend
npm install
npm run dev
```

### Frontend development
```bash
cd frontend
npm install
npm start
```

### Prisma Studio (pro prohlížení databáze)
```bash
docker-compose exec backend npx prisma studio
```

## Poznámky

- Hesla jsou hashována pomocí bcrypt
- JWT tokeny mají defaultní exspiraci 7 dní
- Všechny API endpointy kromě registrace a přihlášení vyžadují autentizaci
- Swagger dokumentace je dostupná na `/api-docs`
- Formuláře mají kompletní validaci na frontendu i backendu
- Inzeráty označené jako smazané se zobrazují přeškrtnuté

## Troubleshooting

Pokud máte problémy se spuštěním:

1. Ujistěte se, že Docker běží
2. Zkuste smazat všechny containery a volumes:
```bash
docker-compose down -v
docker-compose up --build
```
3. Zkontrolujte logy:
```bash
docker-compose logs backend
docker-compose logs frontend
docker-compose logs postgres
```
4. Ujistěte se, že porty 3000, 5000 a 5432 nejsou použity jinými aplikacemi
