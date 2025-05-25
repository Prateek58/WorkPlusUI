# LR (Lorry Receipt) Module

## Overview
The LR Module is a comprehensive system for managing Lorry Receipt entries in the WorkPlus application. It provides full CRUD operations, master data management, document upload functionality, and a modern, user-friendly interface.

## Features

### ✅ Core Functionality
- **Complete CRUD Operations**: Create, Read, Update, Delete LR entries
- **Master Data Management**: Units, Parties, Transporters, Cities
- **Document Management**: Upload and manage documents with file type restrictions
- **Search & Filter**: Real-time search across all LR entry fields
- **Status Management**: Draft, Confirmed, In Transit, Delivered, Cancelled

### ✅ User Experience
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Searchable Dropdowns**: Easy selection with autocomplete functionality
- **Drag & Drop Upload**: Modern file upload with drag and drop support
- **Form Validation**: Client-side validation with helpful error messages
- **Loading States**: Visual feedback during API operations

### ✅ Advanced Features
- **City Management**: Add new cities on-the-fly when not found in dropdown
- **Tabbed Interface**: Organized form with Basic Details, Financial Details, Additional Info, and Documents
- **File Type Validation**: Configurable file type restrictions per document type
- **Pagination**: Efficient handling of large datasets
- **Statistics Dashboard**: Overview cards showing entry counts and totals

## Architecture

### Backend Structure
```
WorkPlusAPI/WorkPlusAPI/WorkPlus/
├── Controllers/LR/
│   └── LRController.cs          # API endpoints
├── Service/LR/
│   └── LRService.cs             # Business logic
└── DTOs/LRDTOs/
    ├── LREntryDTO.cs            # LR entry data transfer objects
    └── LRMasterDataDTO.cs       # Master data DTOs
```

### Frontend Structure
```
WorkPlusUI/workplus-ui/src/Code/LR/
├── pages/
│   └── LRPage.tsx               # Main LR page with dashboard
├── components/
│   ├── LREntriesDialog.tsx      # Full CRUD dialog
│   ├── LREntryFormDialog.tsx    # Create/Edit form
│   ├── CityFormDialog.tsx       # Add new city dialog
│   └── DocumentUpload.tsx       # Document management
├── services/
│   └── lrService.ts             # API service layer
└── index.ts                     # Module exports
```

### Database Schema
```sql
-- Core Tables
units                    # Business units (shared across modules)
lr_parties              # Customer/party master data
lr_transporters         # Transporter master data
lr_entries              # Main LR transaction records
lr_document_types       # Document type configuration
lr_documents            # File upload records
statecity               # City master data (existing table)
```

## API Endpoints

### LR Entries
- `GET /api/LR/entries` - Get all LR entries
- `GET /api/LR/entries/{id}` - Get specific LR entry
- `POST /api/LR/entries` - Create new LR entry
- `PUT /api/LR/entries/{id}` - Update LR entry
- `DELETE /api/LR/entries/{id}` - Delete LR entry

### Master Data
- `GET /api/LR/master-data/units` - Get all units
- `GET /api/LR/master-data/parties` - Get all parties
- `GET /api/LR/master-data/transporters` - Get all transporters
- `GET /api/LR/master-data/cities` - Get all cities
- `GET /api/LR/master-data/cities/search?searchTerm={term}` - Search cities
- `POST /api/LR/master-data/cities` - Create new city
- `GET /api/LR/master-data/document-types` - Get document types

### Documents
- `GET /api/LR/entries/{lrEntryId}/documents` - Get documents for LR entry
- `POST /api/LR/entries/{lrEntryId}/documents` - Upload document
- `DELETE /api/LR/documents/{documentId}` - Delete document

## Usage

### 1. Import the Module
```typescript
import { LRPage } from '../Code/LR';
```

### 2. Use in Routing
```typescript
<Route path="/lr" element={<LRPage />} />
```

### 3. Use Individual Components
```typescript
import { 
  LREntriesDialog, 
  LREntryFormDialog, 
  useLRService 
} from '../Code/LR';

const MyComponent = () => {
  const { getLREntries } = useLRService();
  // ... component logic
};
```

## Required Fields
- **Unit**: Business unit (required)
- **Party**: Customer/party (required)
- **Transporter**: Transport company (required)
- **LR Number**: Unique identifier (required)
- **LR Date**: Date of LR (required)

## Optional Fields
- Bill Date, Bill Number, Truck Number
- Weight, Rate, Quantity, Amount details
- Origin/Destination cities
- Driver information
- Remarks and status

## Document Management
- Configurable file types per document category
- File size limit: 10MB per file
- Drag & drop upload interface
- Document type validation
- Delete functionality

## City Management
- Search existing cities with autocomplete
- Add new cities when not found
- Immediate availability after creation
- State and coordinate support

## Status Workflow
1. **Draft** - Initial state, can be edited
2. **Confirmed** - Confirmed for processing
3. **In Transit** - Goods in transportation
4. **Delivered** - Successfully delivered
5. **Cancelled** - Cancelled entry

## Dependencies
- Material-UI components
- React Hook Form (if used)
- Axios for API calls
- Day.js for date handling

## Future Enhancements
- [ ] Bulk operations
- [ ] Export functionality
- [ ] Print/PDF generation
- [ ] Advanced filtering
- [ ] Audit trail
- [ ] Email notifications
- [ ] Mobile app support

## Development Notes
- Uses TypeScript for type safety
- Follows Material Design principles
- Responsive design patterns
- Error handling and loading states
- Optimistic UI updates
- Clean code architecture 