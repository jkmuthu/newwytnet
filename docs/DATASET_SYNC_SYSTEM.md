# Dataset Sync System - Complete Implementation Plan

## 🎯 Overview

This document outlines the complete implementation of the Dataset Sync System with Hub consolidation, external API integration, and automated sync capabilities for the WytNet Engine Admin Panel.

---

## 📋 Consolidated Implementation Plan

### **Phase 1: Database Schema Enhancement** ✅ COMPLETE
**Status**: Schema updated and pushed

**Tables Created**:
1. **`dataset_hubs`** - Logical grouping of related datasets
   - Fields: id, key, name, description, icon, sortOrder, isActive, metadata
   - Purpose: Group related collections (e.g., geo, localization, business)

2. **`data_sources`** - External API configuration
   - Fields: id, key, name, baseUrl, apiType, authType, authConfig, isActive, isFree, rateLimitPerHour
   - Purpose: Track external data providers (REST Countries, GeoNames, etc.)

3. **`dataset_collections`** (Enhanced)
   - New Fields: hubId, dataSourceId, syncEnabled, syncFrequency, lastSyncedAt, lastSyncStatus, syncCount
   - Purpose: Link to hub and data source, track sync status

4. **`dataset_items`** (Enhanced)
   - New Fields: parentId, updatedAt
   - Purpose: Support hierarchical data (state → country)

**6 Hubs Defined**:
1. 🌍 **Geographic Data** - Countries, States, Cities, Timezones, Postal Codes
2. 🌐 **Localization** - Languages, Currencies, Date/Number Formats
3. 💼 **Business Reference** - Industries, Job Titles, Company Sizes
4. ⚙️ **App Configuration** - Categories, Pricing Models, Feature Flags
5. 🎓 **Education & Skills** - Education Levels, Degrees, Certifications
6. 📅 **Time & Calendar** - Timezones, Calendar Types, Holidays

---

### **Phase 2: Data Source Integration**
**Status**: Seed data ready

**External APIs Configured**:

1. **REST Countries API** (Free)
   - Endpoint: `https://restcountries.com/v3.1`
   - Purpose: Comprehensive country data
   - Refresh: Monthly
   - Rate Limit: 1000/hour

2. **GeoNames API** (Free tier)
   - Endpoint: `http://api.geonames.org`
   - Purpose: Cities, states, postal codes
   - Auth: API Key (username parameter)
   - Refresh: Monthly
   - Rate Limit: 20,000/hour

3. **Exchange Rates API** (Paid)
   - Endpoint: `https://api.exchangerate-api.com/v4`
   - Purpose: Currency exchange rates
   - Refresh: Daily
   - Rate Limit: 1500/hour

4. **TimezoneDB API** (Free tier)
   - Endpoint: `http://api.timezonedb.com/v2.1`
   - Purpose: Timezone information
   - Refresh: Quarterly
   - Rate Limit: 1000/hour

5. **Manual Entry**
   - Purpose: Custom curated data without external sync

---

### **Phase 3: Hub-Level APIs**
**Status**: To be implemented

**Endpoints**:

```typescript
// Hub Management
GET    /api/datasets/hubs                    // List all hubs
GET    /api/datasets/hubs/:hubKey            // Get hub with all collections
GET    /api/datasets/hubs/:hubKey/:type      // Get specific collection type
GET    /api/datasets/hubs/:hubKey/hierarchy  // Get hierarchical data
POST   /api/datasets/hubs/:hubKey/sync       // Sync entire hub

// Developer-friendly filtered queries
GET    /api/datasets/hubs/geo/countries
GET    /api/datasets/hubs/geo/states?countryCode=IN
GET    /api/datasets/hubs/geo/cities?countryCode=IN&stateCode=TN
GET    /api/datasets/hubs/geo/hierarchy?countryCode=IN

// Get multiple types at once
GET    /api/datasets/hubs/geo?include=countries,states,cities
```

**Response Examples**:

```json
// GET /api/datasets/hubs/geo
{
  "success": true,
  "hub": {
    "id": "uuid",
    "key": "geo",
    "name": "Geographic Data",
    "icon": "🌍"
  },
  "collections": [
    {
      "key": "countries",
      "name": "Countries",
      "itemCount": 250,
      "lastSyncedAt": "2025-10-28T10:00:00Z",
      "syncStatus": "success",
      "items": [...]
    }
  ]
}

// GET /api/datasets/hubs/geo/hierarchy?countryCode=IN
{
  "success": true,
  "country": {
    "code": "IN",
    "label": "India",
    "metadata": { "phonePrefix": "+91", "currency": "INR" }
  },
  "states": [
    {
      "code": "TN",
      "label": "Tamil Nadu",
      "cities": [
        { "code": "CBE", "label": "Coimbatore" },
        { "code": "CHN", "label": "Chennai" }
      ]
    }
  ]
}
```

---

### **Phase 4: Collection-Level Sync APIs**
**Status**: To be implemented

**Endpoints**:

```typescript
// Admin Sync Operations
POST   /api/admin/datasets/:collectionId/sync           // Trigger sync
GET    /api/admin/datasets/:collectionId/sync-status    // Check sync status
GET    /api/admin/datasets/sources                       // List available data sources
POST   /api/admin/datasets/sources/:sourceId/test       // Test API connection
GET    /api/admin/datasets/sync-logs                     // View sync history
```

**Sync Process**:
1. Check if sync is already in progress
2. Set `lastSyncStatus = 'in_progress'`
3. Fetch data from external API
4. Transform data to internal format
5. Upsert items (insert or update)
6. Update `lastSyncedAt`, `lastSyncStatus`, `syncCount`
7. Log sync results

**Data Transformation Example**:

```typescript
// REST Countries API Response
{
  "name": { "common": "India", "official": "Republic of India" },
  "cca2": "IN",
  "currencies": { "INR": { "name": "Indian rupee", "symbol": "₹" } },
  "idd": { "root": "+9", "suffixes": ["1"] }
}

// Transform to DatasetItem
{
  "code": "IN",
  "label": "India",
  "metadata": {
    "officialName": "Republic of India",
    "phonePrefix": "+91",
    "currency": "INR",
    "currencySymbol": "₹"
  }
}
```

---

### **Phase 5: Admin UI Updates**
**Status**: To be implemented

**Features**:

1. **Hub Grouping View**
   - Card grid showing all 6 hubs
   - Collections count per hub
   - Quick stats (total items, last sync)

2. **Collection Detail with Sync**
   - "Sync Now" button with loading state
   - Last synced timestamp (relative time)
   - Sync status badge (success/failed/in_progress/never)
   - Sync history timeline
   - Data source information

3. **Sync Configuration Panel**
   - Enable/disable auto-sync
   - Set sync frequency (manual/hourly/daily/weekly/monthly)
   - Configure data source
   - Test API connection

4. **Data Source Management**
   - List all available data sources
   - Add custom data sources
   - Test API connections
   - View rate limits and usage

**UI Components**:

```tsx
// Sync Button Component
<Button 
  onClick={handleSync} 
  disabled={isSyncing || !collection.syncEnabled}
  data-testid="button-sync-collection"
>
  {isSyncing ? (
    <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Syncing...</>
  ) : (
    <><RefreshCw className="h-4 w-4 mr-2" /> Sync Now</>
  )}
</Button>

// Sync Status Badge
<Badge variant={getSyncStatusVariant(status)}>
  {status === 'success' && <CheckCircle2 className="h-3 w-3 mr-1" />}
  {status === 'failed' && <XCircle className="h-3 w-3 mr-1" />}
  {status === 'in_progress' && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
  {status.toUpperCase()}
</Badge>

// Last Synced Display
<div className="text-sm text-muted-foreground">
  Last synced: {formatDistanceToNow(lastSyncedAt)} ago
</div>
```

---

### **Phase 6: Seed Data & Migration**
**Status**: Seed file created, ready to run

**Steps**:
1. ✅ Create hubs (6 hubs)
2. ✅ Create data sources (5 sources)
3. ✅ Link existing collections to hubs
4. ⏳ Run seed SQL
5. ⏳ Test sync functionality
6. ⏳ Verify UI displays correctly

**Seed Command**:
```bash
# Run seed data
psql $DATABASE_URL -f server/dataset-seed.sql
```

---

## 🔧 Implementation Details

### **Backend Sync Service**

```typescript
// server/services/datasetSync.ts

export class DatasetSyncService {
  async syncCollection(collectionId: string): Promise<SyncResult> {
    const collection = await getCollection(collectionId);
    const dataSource = await getDataSource(collection.dataSourceId);
    
    // Set in progress
    await updateSyncStatus(collectionId, 'in_progress');
    
    try {
      // Fetch from external API
      const externalData = await this.fetchFromSource(dataSource, collection);
      
      // Transform data
      const items = this.transformData(externalData, collection);
      
      // Upsert items
      const result = await this.upsertItems(collectionId, items);
      
      // Update success status
      await updateSyncStatus(collectionId, 'success', {
        itemsAdded: result.added,
        itemsUpdated: result.updated,
        lastSyncedAt: new Date()
      });
      
      return { success: true, ...result };
    } catch (error) {
      // Update failed status
      await updateSyncStatus(collectionId, 'failed', {
        error: error.message
      });
      
      throw error;
    }
  }
  
  private async fetchFromSource(source: DataSource, collection: DatasetCollection) {
    const url = this.buildUrl(source, collection);
    const headers = this.buildHeaders(source);
    
    const response = await fetch(url, { headers });
    return response.json();
  }
  
  private transformData(data: any[], collection: DatasetCollection): DatasetItem[] {
    const mapping = collection.metadata.dataMapping;
    return data.map(item => this.transformItem(item, mapping));
  }
}
```

---

## 🚀 Benefits

### **For Developers**
✅ Single API call for related data  
✅ Hierarchical queries (country → states → cities)  
✅ Filtered queries with query parameters  
✅ Always up-to-date data from external sources  
✅ Consistent data structure across all datasets  

### **For Super Admins**
✅ One-click sync to update datasets  
✅ Automated sync scheduling (hourly/daily/weekly)  
✅ Sync status monitoring and error tracking  
✅ Hub-based organization for better management  
✅ Support for custom data sources  

### **For Platform**
✅ Reduced manual data entry  
✅ Consistent, validated data  
✅ Scalable architecture  
✅ Easy to add new data sources  
✅ Performance optimization with caching  

---

## 📊 API Query Examples

```javascript
// Fetch all countries
const countries = await fetch('/api/datasets/hubs/geo/countries');

// Fetch states for India
const states = await fetch('/api/datasets/hubs/geo/states?countryCode=IN');

// Fetch cities in Tamil Nadu, India
const cities = await fetch('/api/datasets/hubs/geo/cities?countryCode=IN&stateCode=TN');

// Get complete hierarchy for India
const hierarchy = await fetch('/api/datasets/hubs/geo/hierarchy?countryCode=IN');

// Get all localization data at once
const localization = await fetch('/api/datasets/hubs/localization');

// Get active currencies only
const currencies = await fetch('/api/datasets/hubs/localization/currencies?active=true');
```

---

## 🔐 Security Considerations

1. **API Key Management**: Store in environment variables (never in code)
2. **Rate Limiting**: Implement rate limiting on sync endpoints
3. **Authentication**: Only Super Admins can trigger manual sync
4. **Validation**: Validate external data before inserting
5. **Logging**: Log all sync operations for audit trail

---

## 📈 Future Enhancements

1. **Webhook Support**: Receive updates from data sources
2. **Conflict Resolution**: Handle data conflicts intelligently
3. **Versioning**: Track dataset versions over time
4. **Export**: Export datasets in multiple formats (JSON, CSV, XML)
5. **Analytics**: Track dataset usage and popularity
6. **Caching**: Redis cache for frequently accessed datasets
7. **CDN**: Serve static dataset files from CDN

---

## ✅ Checklist for Implementation

- [x] Database schema created
- [x] TypeScript types defined
- [x] Seed data prepared
- [ ] Run database migration
- [ ] Create sync service
- [ ] Create API endpoints
- [ ] Update admin UI
- [ ] Add sync button and status
- [ ] Test sync functionality
- [ ] Add error handling
- [ ] Document API usage
- [ ] Deploy to production

---

**Author**: WytNet Development Team  
**Last Updated**: October 29, 2025  
**Version**: 1.0.0
