#!/usr/bin/env bash
(cd frontend && npm run build) && (cd backend && npm run build)
