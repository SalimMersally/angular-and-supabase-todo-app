# Supabase Database Setup

## Prerequisites

1. Make sure you have a Supabase project created
2. Ensure your Supabase URL and anon key are correctly configured in `src/environments/environment.ts`

## Database Setup

### 1. Create the todos table

1. Open your Supabase dashboard
2. Go to the **SQL Editor**
3. Copy and paste the content from `database/create_todos_table.sql`
4. Run the SQL script

This will create:

- The `todos` table with proper schema
- Row Level Security (RLS) policies to ensure users can only access their own todos
- Indexes for better performance
- Triggers for automatic timestamp updates

### 2. Verify the setup

After running the SQL script, you should see:

- A new `todos` table in your database
- RLS policies applied to the table
- Proper foreign key relationship with `auth.users`

## Features

The TodoService now provides full Supabase integration:

- ✅ **User-specific data**: Each user can only see and manage their own todos
- ✅ **Real-time data**: All CRUD operations work with the Supabase database
- ✅ **Security**: Row Level Security ensures data isolation between users
- ✅ **Performance**: Proper indexing for fast queries
- ✅ **Automatic timestamps**: Created and updated timestamps are handled automatically
- ✅ **Timezone handling**: Dates stored in UTC, displayed in user's local timezone

## Timezone Handling

The application properly handles timezones:

1. **Storage**: All dates are stored in UTC in the Supabase database
2. **Conversion**: JavaScript `Date` objects automatically handle timezone conversion
3. **Display**: Dates are displayed to users in their local timezone
4. **Input**: When users input dates, they're converted to UTC for storage

### Technical Implementation

- **Database**: Uses `TIMESTAMP WITH TIME ZONE` to store UTC timestamps
- **Service Layer**: `toISOString()` converts local dates to UTC for storage
- **Frontend**: `new Date()` constructor converts UTC strings to local timezone
- **User Experience**: Users see and input dates in their local timezone

## API Methods

- `getTodos()`: Fetch all todos for the authenticated user
- `addTodo(request)`: Create a new todo
- `updateTodo(todo)`: Update an existing todo
- `updateTodoStatus(id, isCompleted)`: Toggle todo completion status
- `deleteTodo(id)`: Delete a todo
- `getTodoById(id)`: Get a specific todo by ID

All methods require user authentication and automatically handle user-specific data isolation.
