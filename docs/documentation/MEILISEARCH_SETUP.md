# WytNet Production Search Setup with Meilisearch

## Overview

WytNet includes a comprehensive production-ready search system powered by Meilisearch, providing fast full-text search across all platform content including tenants, users, CRUD models, CMS pages, applications, trademarks, TM numbers, and media files.

## Features

✅ **Multi-tenant search** with automatic filtering  
✅ **Real-time indexing** with background processing  
✅ **Advanced filtering** by status, category, date ranges  
✅ **Autocomplete/suggestions** for enhanced UX  
✅ **Highlighted search results** with relevance scoring  
✅ **Global search** across all content types  
✅ **Search analytics** and performance monitoring  
✅ **Mock service** for development without Meilisearch  

## Production Deployment

### 1. Install Meilisearch

#### Option A: Docker (Recommended)
```bash
# Pull and run Meilisearch
docker run -it --rm \
  -p 7700:7700 \
  -v $(pwd)/meili_data:/meili_data \
  getmeili/meilisearch:v1.6 \
  --master-key="your-super-secret-master-key" \
  --db-path="/meili_data"
```

#### Option B: Binary Installation
```bash
# Download Meilisearch binary
curl -L https://install.meilisearch.com | sh

# Run Meilisearch
./meilisearch --master-key="your-super-secret-master-key" --db-path="./meili_data"
```

#### Option C: Cloud Service
Use Meilisearch Cloud for managed hosting:
- Visit: https://www.meilisearch.com/cloud
- Create an account and get your API keys

### 2. Environment Variables

Add these environment variables to your production environment:

```bash
# Meilisearch Configuration
MEILISEARCH_URL=http://localhost:7700  # or your cloud URL
MEILISEARCH_API_KEY=your-search-only-api-key  # NOT the master key
```

**Security Note**: Never use the master key in your application. Generate a search-only API key:

```bash
# Generate search API key (replace with your master key)
curl -X POST 'http://localhost:7700/keys' \
  -H 'Authorization: Bearer your-master-key' \
  -H 'Content-Type: application/json' \
  --data-binary '{
    "description": "WytNet Search API Key",
    "actions": ["search", "documents.get"],
    "indexes": ["*"],
    "expiresAt": null
  }'
```

### 3. Multi-tenancy Security

For production multi-tenant applications, use tenant tokens:

```javascript
// Generate tenant-specific tokens in your application
const tenantToken = client.generateTenantToken(
  searchApiKey,
  {
    searchRules: {
      '*': {
        filter: `tenantId = "${currentTenant.id}"`
      }
    },
    expiresAt: new Date(Date.now() + 3600000) // 1 hour
  }
);
```

## Development Setup

### Mock Service

The system automatically uses a mock search service when Meilisearch is not available, allowing development without external dependencies.

### Local Meilisearch

For local development with real search:

1. Install Meilisearch locally:
```bash
curl -L https://install.meilisearch.com | sh
```

2. Run with development settings:
```bash
./meilisearch --env development
```

3. The application will automatically detect and use the local instance.

## API Endpoints

### Search Endpoints

- `GET /api/search/global` - Search across all content
- `GET /api/search/tenants` - Search organizations
- `GET /api/search/users` - Search users
- `GET /api/search/whatsapp-users` - Search WhatsApp users
- `GET /api/search/models` - Search CRUD models
- `GET /api/search/pages` - Search CMS pages
- `GET /api/search/apps` - Search applications
- `GET /api/search/trademarks` - Search trademarks
- `GET /api/search/tm-numbers` - Search TM numbers
- `GET /api/search/media` - Search media files

### Management Endpoints

- `GET /api/search/suggestions/:index` - Get autocomplete suggestions
- `GET /api/search/stats` - Search index statistics
- `GET /api/search/health` - Search service health check
- `POST /api/search/rebuild` - Rebuild search indexes (admin)

### Query Parameters

All search endpoints support these parameters:

- `q` - Search query (required)
- `limit` - Number of results (default: 20)
- `offset` - Pagination offset (default: 0)
- `tenantId` - Filter by tenant (where applicable)
- `status` - Filter by status
- `filter` - Advanced filters (Meilisearch syntax)

## Search Interface

Access the search interface at `/search` to test and explore search functionality.

### Features

- **Category selection** - Search specific content types
- **Real-time suggestions** - Autocomplete as you type
- **Recent searches** - Quick access to previous queries
- **Result highlighting** - Highlighted matching terms
- **Performance metrics** - Search time and result counts
- **Index statistics** - Monitor document counts and indexing status

## Performance Optimization

### Indexing Strategy

1. **Batch processing** - Documents are indexed in batches of 1,000
2. **Background indexing** - Initial population doesn't block server startup
3. **Incremental updates** - Real-time updates for new/modified content
4. **Retry logic** - Automatic retry on indexing failures

### Search Configuration

The system is optimized for:

- **Searchable attributes** - Title, description, content fields prioritized
- **Filterable attributes** - Status, tenant, category, dates for filtering
- **Sortable attributes** - Creation date, update date, names for sorting
- **Displayed attributes** - Only essential fields returned for performance

## Monitoring

### Health Checks

Monitor search service health:
```bash
curl http://localhost:5000/api/search/health
```

### Index Statistics

Get index statistics:
```bash
curl http://localhost:5000/api/search/stats
```

### Performance Metrics

Each search response includes:
- `processingTimeMs` - Search processing time
- `totalHits` - Total matching results
- `query` - Processed search query

## Troubleshooting

### Common Issues

1. **Connection Refused**
   - Ensure Meilisearch is running on the configured port
   - Check firewall and network settings

2. **Authentication Failed**
   - Verify API key is correct and has proper permissions
   - Don't use master key in production applications

3. **Index Not Found**
   - Run index rebuild: `POST /api/search/rebuild`
   - Check server logs for initialization errors

4. **Slow Search Performance**
   - Monitor index size and memory usage
   - Consider index optimization settings
   - Check network latency to Meilisearch instance

### Debug Mode

Enable debug logging by setting:
```bash
MEILISEARCH_DEBUG=true
```

## Scaling Considerations

### Production Deployment

1. **Dedicated Server** - Run Meilisearch on dedicated hardware
2. **Memory Requirements** - Allocate sufficient RAM for indexes
3. **Backup Strategy** - Regular backups of Meilisearch data
4. **Load Balancing** - Multiple Meilisearch instances for high availability

### Performance Tuning

1. **Index Settings** - Optimize for your specific use case
2. **Batch Size** - Adjust based on available memory
3. **Update Frequency** - Balance real-time vs. performance needs
4. **Cache Strategy** - Implement application-level caching

## Security Checklist

- [ ] Use search-only API keys, never master key
- [ ] Generate tenant tokens for multi-tenant applications
- [ ] Enable HTTPS for all Meilisearch communication
- [ ] Regularly rotate API keys
- [ ] Monitor and log search access
- [ ] Implement rate limiting on search endpoints
- [ ] Validate and sanitize search inputs

## Migration from Other Search Services

### From Elasticsearch
- Index mapping conversion utility available
- Bulk import tools for existing data
- Query syntax differences documented

### From Algolia
- API compatibility layer available
- Feature parity mapping guide
- Cost comparison calculator

## Support

For production support and advanced configuration:
- Meilisearch Documentation: https://docs.meilisearch.com
- WytNet Search Issues: Create an issue with search logs
- Performance Optimization: Contact for enterprise consultation