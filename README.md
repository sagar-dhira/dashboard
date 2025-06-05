# Pregnancy Dashboard

A responsive web dashboard for monitoring high-risk pregnancy cases in Telangana, built with Node.js, Express, and PostgreSQL.

## Features

- 📊 Real-time analytics and statistics
- 📱 Mobile-first responsive design
- 📈 Interactive charts and visualizations
- 🗂️ District and village-wise breakdowns
- 📡 REST API for data access
- 🔄 Auto-refresh functionality

## Screenshots

The dashboard includes:
- Total mothers and pregnancy count statistics
- Weekly trends of HRP (High-Risk Pregnancy) cases
- District-wise and village-wise case distributions
- Active pregnancy monitoring
- Risk category analysis

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL database access
- Modern web browser

## Installation

1. **Clone or download the project**
   ```bash
   cd dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Database Configuration**
   
   The application is configured to connect to:
   - Host: 18.236.48.141
   - Port: 7654
   - Database: Datastore
   - Schema: telangana_pregnancy_data
   - Table: high_risk_pregnancy_cases
   - Username: postgres
   - Password: password

4. **Start the server**
   ```bash
   npm start
   ```
   
   For development with auto-restart:
   ```bash
   npm run dev
   ```

5. **Access the dashboard**
   
   Open your browser and navigate to: `http://localhost:8080`

## API Endpoints

### Statistics
- `GET /api/stats` - Overall statistics including total cases, recent cases, active pregnancies, and deliveries

### Cases Data
- `GET /api/cases` - Get all cases with pagination
- `GET /api/cases/by-district` - Cases grouped by district
- `GET /api/cases/by-village` - Cases grouped by village
- `GET /api/cases/by-age-group` - Cases grouped by age ranges
- `GET /api/cases/by-risk-category` - Cases grouped by risk category

### Trends
- `GET /api/trends/weekly` - Weekly trends for the last 12 weeks
- `GET /api/trends/monthly` - Monthly trends for the last 12 months

### Active Pregnancies
- `GET /api/active-pregnancies/by-district` - Active pregnancies by district

### Health Check
- `GET /api/health` - Database connection health check

## Project Structure

```
dashboard/
├── server.js              # Main server file
├── package.json           # Node.js dependencies
├── public/               # Static files
│   ├── index.html        # Main dashboard HTML
│   ├── css/
│   │   └── style.css     # Custom styles
│   └── js/
│       └── dashboard.js  # Dashboard JavaScript
└── README.md            # This file
```

## Technologies Used

- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL with pg driver
- **Frontend**: HTML5, CSS3, Bootstrap 5
- **Charts**: Chart.js
- **Icons**: Font Awesome

## Database Schema

The application expects a `telangana_pregnancy_data.high_risk_pregnancy_cases` table with columns such as:
- `id` - Primary key
- `created_at` - Timestamp
- `district` - District name
- `village` - Village name
- `age` - Mother's age
- `risk_category` - Risk classification
- `status` - Case status
- `delivery_date` - Delivery date (if applicable)

## Responsive Design

The dashboard is optimized for:
- 📱 Mobile devices (320px+)
- 📱 Tablets (768px+)
- 💻 Desktop (1024px+)

## Features

### Dashboard Sections

1. **Header** - Navigation with back button and profile
2. **Statistics Cards** - Key metrics overview
3. **Charts and Visualizations**:
   - Weekly trend line chart
   - District-wise horizontal bar charts
   - Village-wise case distributions
   - Age group analysis
   - Risk category breakdowns
   - Active pregnancy monitoring

### Real-time Updates

- Statistics refresh every 5 minutes
- Responsive charts that adapt to screen size
- Loading states for better user experience

## API Usage Examples

```javascript
// Get overall statistics
fetch('/api/stats')
  .then(response => response.json())
  .then(data => console.log(data));

// Get cases by district
fetch('/api/cases/by-district')
  .then(response => response.json())
  .then(data => console.log(data));

// Get weekly trends
fetch('/api/trends/weekly')
  .then(response => response.json())
  .then(data => console.log(data));
```

## Troubleshooting

### Database Connection Issues
- Verify database credentials in `server.js`
- Ensure PostgreSQL server is accessible
- Check firewall settings

### Port Conflicts
- Change the port in `server.js` if 3000 is in use
- Update any hardcoded URLs accordingly

### Chart Loading Issues
- Ensure internet connection for CDN resources
- Check browser console for JavaScript errors

## Development

To contribute or modify:

1. Fork the repository
2. Make your changes
3. Test thoroughly on mobile and desktop
4. Submit a pull request

## License

This project is licensed under the ISC License - see the package.json file for details.

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review the API endpoints
3. Verify database connectivity with `/api/health` 