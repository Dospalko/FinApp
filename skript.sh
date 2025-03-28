#!/bin/bash

echo "Creating backend directory structure..."

# Hlavný priečinok backendu
mkdir -p backend/app backend/migrations
cd backend

# Vytvorenie súborov priamo v backend/
touch run.py

# Vytvorenie pod-priečinkov v app/
mkdir -p app/models app/routes app/schemas app/services

# Vytvorenie súborov v app/ a jeho pod-priečinkoch
touch app/__init__.py
touch app/config.py
touch app/database.py
touch app/errors.py

touch app/models/__init__.py
touch app/models/expense.py

touch app/routes/__init__.py
touch app/routes/expense_routes.py
touch app/routes/base_routes.py

touch app/schemas/__init__.py
touch app/schemas/expense_schema.py

touch app/services/__init__.py
touch app/services/expense_service.py

# Prázdny súbor v migrations (často sa používa .gitkeep na sledovanie prázdnych priečinkov)
touch migrations/.gitkeep

echo "Backend structure created successfully in 'backend/' directory."
echo "Current directory: $(pwd)"

cd .. # Vráti sa späť do pôvodného priečinka