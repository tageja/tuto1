# Airtable Integration Setup Guide

This guide will help you set up Airtable integration for the TutoApp.

## 🚀 Quick Start

### 1. Get Your Airtable Credentials

1. **Create an Airtable account** at [airtable.com](https://airtable.com)
2. **Create a new base** for your tutoring app
3. **Get your API key**:
   - Go to your account settings
   - Navigate to "API" section
   - Copy your API key
4. **Get your Base ID**:
   - Open your base in Airtable
   - Go to Help → API Documentation
   - Copy the Base ID from the URL

### 2. Set Up Environment Variables

Create a `.env` file in your project root:

```env
EXPO_PUBLIC_AIRTABLE_API_KEY=your_api_key_here
EXPO_PUBLIC_AIRTABLE_BASE_ID=your_base_id_here
```

### 3. Create Tables in Airtable

You need to create the following tables in your Airtable base:

#### **Teachers Table**
| Field Name | Type | Required | Options |
|------------|------|----------|---------|
| Name | Single line text | ✅ | |
| Email | Single line text | ✅ | |
| Phone | Single line text | | |
| Avatar | Single line text | | |
| Subjects | Multiple select | | Mathematics, English, Physics, Chemistry, Literature, Music |
| Qualifications | Long text | | |
| Experience | Number | | |
| Hourly Rate | Number | | |
| Rating | Number | | |
| Review Count | Number | | |
| Location | Single line text | | |
| Latitude | Number | | |
| Longitude | Number | | |
| Availability | Long text | | |
| Languages | Multiple select | | Vietnamese, English, Chinese, French |
| Description | Long text | | |
| Status | Single select | | Active, Inactive |

#### **Students Table**
| Field Name | Type | Required | Options |
|------------|------|----------|---------|
| Name | Single line text | ✅ | |
| Age | Number | | |
| Grade | Single line text | | |
| Parent ID | Link to another record | | Link to Parents table |
| Subjects of Interest | Multiple select | | Mathematics, English, Physics, Chemistry, Literature, Music |
| Address | Long text | | |
| Phone | Single line text | | |
| Email | Single line text | | |
| Status | Single select | | Active, Inactive |

#### **Parents Table**
| Field Name | Type | Required | Options |
|------------|------|----------|---------|
| Name | Single line text | ✅ | |
| Email | Single line text | ✅ | |
| Phone | Single line text | | |
| Address | Long text | | |
| Children | Link to another record | | Link to Students table |
| Payment Method | Single select | | Credit Card, Bank Transfer, Cash |
| Status | Single select | | Active, Inactive |

#### **Bookings Table**
| Field Name | Type | Required | Options |
|------------|------|----------|---------|
| Student ID | Link to another record | ✅ | Link to Students table |
| Teacher ID | Link to another record | ✅ | Link to Teachers table |
| Parent ID | Link to another record | ✅ | Link to Parents table |
| Subject | Single line text | ✅ | |
| Date | Date | ✅ | |
| Time | Single line text | ✅ | |
| Duration | Number | | |
| Status | Single select | | Pending, Confirmed, Completed, Cancelled |
| Notes | Long text | | |
| Payment Status | Single select | | Pending, Paid, Refunded |
| Created At | Date | | |

#### **Subjects Table**
| Field Name | Type | Required | Options |
|------------|------|----------|---------|
| Name | Single line text | ✅ | |
| Name (Vietnamese) | Single line text | | |
| Icon | Single line text | | |
| Category | Single select | | Academic, Extracurricular |
| Description | Long text | | |
| Status | Single select | | Active, Inactive |

#### **Reviews Table**
| Field Name | Type | Required | Options |
|------------|------|----------|---------|
| Teacher ID | Link to another record | ✅ | Link to Teachers table |
| Student ID | Link to another record | ✅ | Link to Students table |
| Rating | Number | ✅ | |
| Comment | Long text | | |
| Created At | Date | | |

#### **Payments Table**
| Field Name | Type | Required | Options |
|------------|------|----------|---------|
| Booking ID | Link to another record | ✅ | Link to Bookings table |
| Amount | Number | ✅ | |
| Currency | Single line text | | |
| Status | Single select | | Pending, Paid, Refunded |
| Payment Method | Single line text | | |
| Created At | Date | | |

#### **Homework Table**
| Field Name | Type | Required | Options |
|------------|------|----------|---------|
| Student ID | Link to another record | ✅ | Link to Students table |
| Teacher ID | Link to another record | ✅ | Link to Teachers table |
| Subject | Single line text | ✅ | |
| Title | Single line text | ✅ | |
| Description | Long text | | |
| Due Date | Date | | |
| Status | Single select | | Assigned, Submitted, Graded |
| Adaptive Level | Number | | |

### 4. Run the Setup Script

```bash
# Set your environment variables
export AIRTABLE_API_KEY=your_api_key_here
export AIRTABLE_BASE_ID=your_base_id_here

# Run the setup script
node scripts/setup-airtable.js
```

### 5. Test the Integration

The app is now ready to use Airtable! You can:

- Create teachers, students, and parents
- Make bookings
- Add reviews
- Track payments
- Manage homework

## 🔧 Advanced Configuration

### Custom Fields

You can add custom fields to any table. Just make sure to:

1. Add the field to the `FIELDS` object in `src/services/airtable.ts`
2. Update the corresponding interface in `src/types/index.ts`
3. Update the mapping functions in `src/hooks/useAirtable.ts`

### API Rate Limits

Airtable has rate limits:
- 5 requests per second per base
- 100,000 requests per month on free plan

### Security Best Practices

1. **Never commit your API key** to version control
2. **Use environment variables** for sensitive data
3. **Set up proper permissions** in Airtable
4. **Regularly rotate your API key**

## 🚨 Troubleshooting

### Common Issues

1. **"Invalid API key" error**
   - Check your API key is correct
   - Ensure the key has proper permissions

2. **"Base not found" error**
   - Verify your Base ID is correct
   - Check you have access to the base

3. **"Table not found" error**
   - Ensure table names match exactly
   - Check table names are case-sensitive

4. **"Field not found" error**
   - Verify field names match exactly
   - Check field types are correct

### Debug Mode

Enable debug logging by adding to your `.env`:

```env
EXPO_PUBLIC_DEBUG=true
```

## 📊 Data Management

### Sample Data

You can add sample data to test the integration:

#### Sample Teachers
- Name: "Nguyễn Thị Anh"
- Email: "anh.nguyen@example.com"
- Subjects: ["Mathematics", "Physics"]
- Hourly Rate: 300000
- Experience: 5

#### Sample Students
- Name: "Trần Văn Minh"
- Age: 15
- Grade: "10th Grade"
- Subjects of Interest: ["Mathematics", "English"]

#### Sample Parents
- Name: "Trần Thị Lan"
- Email: "lan.tran@example.com"
- Phone: "+84 123 456 789"

## 🔄 Updates and Maintenance

### Adding New Tables

1. Add table name to `TABLES` object
2. Add field mappings to `FIELDS` object
3. Create corresponding TypeScript interface
4. Add CRUD operations to `AirtableService`
5. Add hook functions to `useAirtable`

### Modifying Existing Tables

1. Update field mappings in `FIELDS` object
2. Update TypeScript interfaces
3. Update mapping functions in hooks
4. Test thoroughly before deploying

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Verify your Airtable setup
3. Check the console for error messages
4. Ensure all environment variables are set correctly

## 🎯 Next Steps

Once Airtable is set up, you can:

1. **Implement real booking functionality**
2. **Add payment processing**
3. **Create teacher dashboards**
4. **Add student progress tracking**
5. **Implement review system**
6. **Add homework management**

The integration is now ready for production use! 🚀 