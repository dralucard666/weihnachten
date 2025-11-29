#!/bin/bash

echo "================================================"
echo "PostgreSQL Database Setup for Quiz App"
echo "================================================"
echo ""

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "❌ docker-compose not found. Please install Docker Compose first."
    exit 1
fi

echo "1️⃣  Starting PostgreSQL container..."
docker-compose up -d postgres

echo ""
echo "2️⃣  Waiting for PostgreSQL to be ready..."
sleep 5

# Check if postgres is healthy
if docker-compose ps postgres | grep -q "healthy"; then
    echo "✅ PostgreSQL is running and healthy"
else
    echo "⏳ Waiting a bit more for PostgreSQL to initialize..."
    sleep 10
fi

echo ""
echo "3️⃣  Database Information:"
echo "   Host: localhost (or 'postgres' from within Docker)"
echo "   Port: 5432"
echo "   Database: quizdb"
echo "   User: quizuser"
echo "   Password: quizpass"
echo ""

echo "4️⃣  Testing database connection..."
if docker-compose exec -T postgres psql -U quizuser -d quizdb -c "SELECT 'Database connection successful!' as status;" > /dev/null 2>&1; then
    echo "✅ Database connection successful!"
else
    echo "❌ Could not connect to database"
    exit 1
fi

echo ""
echo "5️⃣  Checking tables..."
TABLE_COUNT=$(docker-compose exec -T postgres psql -U quizuser -d quizdb -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';")
echo "   Found $TABLE_COUNT tables"

if [ "$TABLE_COUNT" -ge 3 ]; then
    echo "✅ Database schema initialized correctly"
else
    echo "⚠️  Expected at least 3 tables (questions, answers, order_items)"
fi

echo ""
echo "================================================"
echo "Next steps:"
echo "================================================"
echo ""
echo "To migrate existing JSON questions to the database:"
echo "   cd backend"
echo "   pnpm run migrate"
echo ""
echo "To start the full application:"
echo "   docker-compose up -d --build"
echo ""
echo "To connect to PostgreSQL CLI:"
echo "   docker-compose exec postgres psql -U quizuser -d quizdb"
echo ""
echo "To view logs:"
echo "   docker-compose logs -f postgres"
echo ""
