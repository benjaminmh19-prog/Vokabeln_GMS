# Admin System Guide - Vokabel-Champion

## Overview

The Admin System allows administrators to manage vocabulary lists in Vokabel-Champion. Admins can:
- Set a secure password
- Import new vocabulary lists via CSV files
- Export existing vocabulary lists
- View all imported vocabulary

## Accessing the Admin Panel

### Method 1: Direct URL
Navigate to `/admin` in your browser:
```
https://your-domain.com/admin
```

### Method 2: Menu Button
1. Go to the main menu
2. Click the **ADMIN** button at the bottom of the menu

### Method 3: Keyboard Shortcut
Press **Ctrl+Shift+A** on any page to jump to the admin panel

## Admin Login

### Default Password
- **Default Password:** `admin123`
- **Change this immediately** on first login!

### Setting a Custom Password
The admin password is stored in browser localStorage. To change it:
1. Log in with the current password
2. The system will store your new password in `localStorage.adminPassword`

To set a new password programmatically:
```javascript
localStorage.setItem('adminPassword', 'your-new-password');
```

## Importing Vocabulary

### CSV File Format

The CSV file must have the following structure:

```csv
Unit,Page,English,Deutsch
Unit 1,1,hello,Hallo
Unit 1,1,goodbye,Auf Wiedersehen
Unit 1,2,thank you,Danke
Unit 2,1,apple,Apfel
```

**Required Columns:**
- **Unit**: The unit name (e.g., "Unit 1", "Lektion 2")
- **Page**: The page number (e.g., "1", "2")
- **English**: English word or phrase
- **Deutsch**: German translation (single word preferred)

### Import Steps

1. Log in to the Admin Panel
2. Click **CSV DATEI WÄHLEN** (Choose CSV File)
3. Select your CSV file
4. The system will:
   - Validate all entries
   - Check for required fields
   - Import data to Supabase
5. You'll see a success message with the number of imported items

### Validation Rules

- All four columns must be present
- No empty fields allowed
- Unit and Page must be non-empty strings
- English and Deutsch must be non-empty strings

### Example CSV File

See `example_vocabulary.csv` in the project root for a complete example.

## Exporting Vocabulary

### Export Steps

1. Log in to the Admin Panel
2. Click **EXPORTIEREN** (Export)
3. A CSV file will be downloaded with all vocabulary items
4. File format: `vocabulary_YYYY-MM-DD.csv`

### Export Format

The exported file contains all vocabulary items in the same CSV format as imports:

```csv
Unit,Page,English,Deutsch
Unit 1,1,hello,Hallo
...
```

## Viewing Vocabulary

### View Steps

1. Log in to the Admin Panel
2. Click **VOKABELN ANZEIGEN** (Show Vocabulary)
3. A table displays all imported vocabulary items
4. Click **VOKABELN AUSBLENDEN** to hide the table

### Table Columns

- **Unit**: The unit name
- **Page**: The page number
- **English**: English word/phrase
- **Deutsch**: German translation

## Database Setup

### Required Supabase Tables

The following tables must be created in Supabase:

#### admin_vocabulary
```sql
CREATE TABLE admin_vocabulary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit TEXT NOT NULL,
  page TEXT NOT NULL,
  english TEXT NOT NULL,
  deutsch TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### admin_settings
```sql
CREATE TABLE admin_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Run Migration

Execute the SQL migration in your Supabase console:
1. Go to Supabase Dashboard → Your Project → SQL Editor
2. Copy and run the contents of `migrations/001_create_admin_vocabulary.sql`

## Security Considerations

### Password Storage
- Passwords are stored in browser `localStorage`
- Session state is stored in `sessionStorage`
- **Important:** Use HTTPS in production to prevent password interception

### Best Practices
1. Change the default password immediately
2. Use a strong, unique password
3. Log out after finishing admin tasks
4. Don't share your password
5. Regularly export backups of your vocabulary

### Production Deployment
For production environments, consider:
- Implementing proper authentication (OAuth, JWT)
- Using environment variables for password hashing
- Adding audit logs for all admin actions
- Restricting admin access by IP address

## CSV Import/Export Utilities

### Available Functions

Located in `client/src/lib/csvUtils.ts`:

```typescript
// Parse CSV string to vocabulary array
parseCSV(csvContent: string): AdminVocabulary[]

// Convert vocabulary array to CSV string
toCSV(vocabulary: AdminVocabulary[]): string

// Download CSV file
downloadCSV(csvContent: string, filename?: string): void

// Read file as text
readFileAsText(file: File): Promise<string>

// Validate CSV data
validateCSVData(data: AdminVocabulary[]): { valid: boolean; errors: string[] }
```

## Troubleshooting

### "Falsches Passwort" (Wrong Password)
- Verify you're using the correct password
- Check if you changed it previously
- Reset: Open browser console and run:
  ```javascript
  localStorage.setItem('adminPassword', 'admin123');
  ```

### Import Fails with Validation Errors
- Check CSV file format
- Ensure all required columns are present
- Verify no empty cells
- Use the example file as a template

### No Data Appears After Import
- Check Supabase connection
- Verify tables exist in Supabase
- Check browser console for errors
- Ensure you're logged in as admin

### Export Button Doesn't Work
- Verify Supabase connection
- Check if any vocabulary has been imported
- Look for errors in browser console

## Support

For issues or questions:
1. Check the browser console for error messages
2. Verify Supabase connection and tables
3. Review this guide for common issues
4. Contact the development team

## File Structure

```
client/src/
├── contexts/
│   └── AdminContext.tsx          # Admin authentication & vocabulary management
├── pages/
│   └── AdminPage.tsx              # Admin panel UI
├── lib/
│   └── csvUtils.ts                # CSV parsing & export utilities
└── App.tsx                        # Routes (includes /admin)

migrations/
└── 001_create_admin_vocabulary.sql # Database setup

example_vocabulary.csv              # Example import file
```

## Version History

### v1.0.0
- Initial admin system
- Password-protected login
- CSV import/export functionality
- Supabase integration
- Real-time vocabulary management
