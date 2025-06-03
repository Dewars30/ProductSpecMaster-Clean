#!/bin/bash

# Script to run all tests for ProductSpecMaster

# Set environment variables for testing
export NODE_ENV=test
export PORT=3001
export DATABASE_URL="postgresql://test:test@localhost:5432/test_db"
export OPENAI_API_KEY="test_openai_key"
export GOOGLE_CLIENT_ID="test_google_client_id"
export GOOGLE_CLIENT_SECRET="test_google_client_secret"
export REPLIT_CLIENT_ID="test_replit_client_id"
export REPLIT_CLIENT_SECRET="test_replit_client_secret"
export REPLIT_ENCRYPTION_KEY="test_encryption_key"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Running ESLint...${NC}"
npm run lint
LINT_RESULT=$?

echo -e "${YELLOW}Running TypeScript type check...${NC}"
npm run typecheck
TYPECHECK_RESULT=$?

echo -e "${YELLOW}Running unit tests...${NC}"
npm run test
TEST_RESULT=$?

echo -e "${YELLOW}Running test coverage...${NC}"
npm run test:coverage
COVERAGE_RESULT=$?

# Print summary
echo -e "\n${YELLOW}Test Summary:${NC}"
if [ $LINT_RESULT -eq 0 ]; then
  echo -e "${GREEN}✓ ESLint passed${NC}"
else
  echo -e "${RED}✗ ESLint failed${NC}"
fi

if [ $TYPECHECK_RESULT -eq 0 ]; then
  echo -e "${GREEN}✓ TypeScript check passed${NC}"
else
  echo -e "${RED}✗ TypeScript check failed${NC}"
fi

if [ $TEST_RESULT -eq 0 ]; then
  echo -e "${GREEN}✓ Unit tests passed${NC}"
else
  echo -e "${RED}✗ Unit tests failed${NC}"
fi

if [ $COVERAGE_RESULT -eq 0 ]; then
  echo -e "${GREEN}✓ Coverage tests passed${NC}"
else
  echo -e "${RED}✗ Coverage tests failed${NC}"
fi

# Exit with error if any test failed
if [ $LINT_RESULT -ne 0 ] || [ $TYPECHECK_RESULT -ne 0 ] || [ $TEST_RESULT -ne 0 ] || [ $COVERAGE_RESULT -ne 0 ]; then
  exit 1
fi

exit 0
