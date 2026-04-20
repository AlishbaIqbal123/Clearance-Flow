# Supabase Integration Guide
## University Clearance Management System

This guide provides comprehensive instructions for integrating Supabase into the University Clearance Management System for authentication, real-time features, and storage.

---

## Table of Contents
1. [Overview](#overview)
2. [Setup](#setup)
3. [Authentication Schema](#authentication-schema)
4. [Database Schema](#database-schema)
5. [Row Level Security (RLS) Policies](#row-level-security-rls-policies)
6. [Real-time Subscriptions](#real-time-subscriptions)
7. [Storage Configuration](#storage-configuration)
8. [Integration with Node.js Backend](#integration-with-nodejs-backend)
9. [Frontend Integration](#frontend-integration)
10. [Migration Guide](#migration-guide)

---

## Overview

Supabase can be used as an alternative or complement to the existing MongoDB/JWT authentication system. It provides:

- **Authentication**: Managed user authentication with multiple providers
- **Real-time**: Live database subscriptions for instant updates
- **Storage**: File storage for documents and certificates
- **Database**: PostgreSQL database with Row Level Security

---

## Setup

### 1. Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up/login with your account
3. Click "New Project"
4. Enter project details:
   - **Name**: `university-clearance`
   - **Database Password**: Generate a strong password
   - **Region**: Choose closest to your users (e.g., `Singapore` for Pakistan/Asia)
5. Click "Create New Project"

### 2. Get API Keys

After project creation, go to **Project Settings > API**:

```
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...
```

Add these to your `.env` file:

```env
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Install Supabase Client

```bash
# Backend
npm install @supabase/supabase-js

# Frontend
npm install @supabase/supabase-js
```

---

## Authentication Schema

### User Types in Supabase Auth

Supabase Auth uses a unified `auth.users` table. We'll distinguish user types using custom claims in `raw_user_meta_data`.

### Database Tables for User Profiles

```sql
-- Staff/Admin Profiles Table
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'hod', 'department_officer', 'finance_officer', 'library_officer', 'transport_officer')),
    department_id UUID REFERENCES public.departments(id),
    phone TEXT,
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    is_first_login BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Student Profiles Table
CREATE TABLE public.student_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    registration_number TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    university_email TEXT UNIQUE,
    phone TEXT NOT NULL,
    department_id UUID REFERENCES public.departments(id),
    program TEXT NOT NULL,
    discipline TEXT NOT NULL,
    batch TEXT NOT NULL,
    semester INTEGER,
    cgpa DECIMAL(3,2),
    enrollment_status TEXT DEFAULT 'active' CHECK (enrollment_status IN ('active', 'graduated', 'suspended', 'withdrawn', 'expelled')),
    clearance_status TEXT DEFAULT 'not_started' CHECK (clearance_status IN ('not_started', 'in_progress', 'pending', 'cleared', 'rejected')),
    is_active BOOLEAN DEFAULT true,
    is_first_login BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;
```

### Trigger to Create Profile on Signup

```sql
-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Check user type from metadata
    IF NEW.raw_user_meta_data->>'user_type' = 'student' THEN
        INSERT INTO public.student_profiles (
            id, 
            registration_number,
            first_name, 
            last_name, 
            email,
            university_email,
            phone,
            department_id,
            program,
            discipline,
            batch
        )
        VALUES (
            NEW.id,
            NEW.raw_user_meta_data->>'registration_number',
            NEW.raw_user_meta_data->>'first_name',
            NEW.raw_user_meta_data->>'last_name',
            NEW.email,
            NEW.raw_user_meta_data->>'university_email',
            NEW.raw_user_meta_data->>'phone',
            (NEW.raw_user_meta_data->>'department_id')::UUID,
            NEW.raw_user_meta_data->>'program',
            NEW.raw_user_meta_data->>'discipline',
            NEW.raw_user_meta_data->>'batch'
        );
    ELSE
        INSERT INTO public.profiles (
            id, 
            first_name, 
            last_name, 
            email,
            role,
            department_id,
            phone
        )
        VALUES (
            NEW.id,
            NEW.raw_user_meta_data->>'first_name',
            NEW.raw_user_meta_data->>'last_name',
            NEW.email,
            NEW.raw_user_meta_data->>'role',
            (NEW.raw_user_meta_data->>'department_id')::UUID,
            NEW.raw_user_meta_data->>'phone'
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

---

## Database Schema

### Departments Table

```sql
CREATE TABLE public.departments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    code TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL CHECK (type IN ('academic', 'administrative', 'finance', 'library', 'transport', 'hostel', 'sports', 'medical', 'security', 'custom')),
    description TEXT,
    email TEXT,
    phone TEXT,
    whatsapp TEXT,
    extension TEXT,
    building TEXT,
    floor TEXT,
    room_number TEXT,
    office_hours JSONB DEFAULT '{}',
    clearance_config JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample departments
INSERT INTO public.departments (name, code, type, description, email, phone) VALUES
('Computer Science', 'CS', 'academic', 'Department of Computer Science', 'cs@university.edu.pk', '+92-51-1234567'),
('Software Engineering', 'SE', 'academic', 'Department of Software Engineering', 'se@university.edu.pk', '+92-51-1234568'),
('Finance Department', 'FIN', 'finance', 'Finance and Accounts', 'finance@university.edu.pk', '+92-51-1234569'),
('Library', 'LIB', 'library', 'University Library', 'library@university.edu.pk', '+92-51-1234570'),
('Transport Office', 'TRN', 'transport', 'Transport Department', 'transport@university.edu.pk', '+92-51-1234571');
```

### Clearance Requests Table

```sql
CREATE TABLE public.clearance_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    request_id TEXT UNIQUE NOT NULL,
    student_id UUID REFERENCES public.student_profiles(id) NOT NULL,
    request_type TEXT DEFAULT 'graduation' CHECK (request_type IN ('graduation', 'withdrawal', 'transfer', 'semester_end', 'custom')),
    reason TEXT,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'in_progress', 'pending', 'partially_cleared', 'cleared', 'rejected', 'cancelled')),
    progress JSONB DEFAULT '{"totalDepartments": 0, "clearedDepartments": 0, "pendingDepartments": 0, "percentage": 0}',
    submitted_documents JSONB DEFAULT '[]',
    certificate JSONB DEFAULT '{}',
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX idx_clearance_requests_student ON public.clearance_requests(student_id);
CREATE INDEX idx_clearance_requests_status ON public.clearance_requests(status);
CREATE INDEX idx_clearance_requests_request_id ON public.clearance_requests(request_id);
```

### Clearance Status Table (Department-wise)

```sql
CREATE TABLE public.clearance_status (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    request_id UUID REFERENCES public.clearance_requests(id) ON DELETE CASCADE,
    department_id UUID REFERENCES public.departments(id),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_review', 'cleared', 'rejected', 'on_hold')),
    remarks TEXT,
    cleared_by UUID REFERENCES public.profiles(id),
    cleared_at TIMESTAMP WITH TIME ZONE,
    due_amount DECIMAL(10,2) DEFAULT 0,
    documents_required JSONB DEFAULT '[]',
    checklist_items JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(request_id, department_id)
);

CREATE INDEX idx_clearance_status_request ON public.clearance_status(request_id);
CREATE INDEX idx_clearance_status_department ON public.clearance_status(department_id);
CREATE INDEX idx_clearance_status_status ON public.clearance_status(status);
```

### Comments/Messages Table

```sql
CREATE TABLE public.comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    request_id UUID REFERENCES public.clearance_requests(id) ON DELETE CASCADE,
    author_id UUID NOT NULL,
    author_type TEXT NOT NULL CHECK (author_type IN ('student', 'staff')),
    author_name TEXT NOT NULL,
    message TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_comments_request ON public.comments(request_id);
```

---

## Row Level Security (RLS) Policies

### Profiles Table Policies

```sql
-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

-- Policy: Admins can view all profiles
CREATE POLICY "Admins can view all profiles" 
ON public.profiles FOR SELECT 
USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
));

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

-- Policy: Admins can update all profiles
CREATE POLICY "Admins can update all profiles" 
ON public.profiles FOR UPDATE 
USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
));
```

### Student Profiles Policies

```sql
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;

-- Students can view their own profile
CREATE POLICY "Students can view own profile" 
ON public.student_profiles FOR SELECT 
USING (auth.uid() = id);

-- Staff can view all student profiles
CREATE POLICY "Staff can view all student profiles" 
ON public.student_profiles FOR SELECT 
USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid()
));

-- Students can update their own profile (limited fields)
CREATE POLICY "Students can update own profile" 
ON public.student_profiles FOR UPDATE 
USING (auth.uid() = id);
```

### Clearance Requests Policies

```sql
ALTER TABLE public.clearance_requests ENABLE ROW LEVEL SECURITY;

-- Students can view their own requests
CREATE POLICY "Students can view own requests" 
ON public.clearance_requests FOR SELECT 
USING (EXISTS (
    SELECT 1 FROM public.student_profiles 
    WHERE id = auth.uid() AND student_profiles.id = clearance_requests.student_id
));

-- Staff can view all requests
CREATE POLICY "Staff can view all requests" 
ON public.clearance_requests FOR SELECT 
USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid()
));

-- Students can create requests
CREATE POLICY "Students can create requests" 
ON public.clearance_requests FOR INSERT 
WITH CHECK (EXISTS (
    SELECT 1 FROM public.student_profiles 
    WHERE id = auth.uid() AND student_profiles.id = clearance_requests.student_id
));

-- Staff can update requests
CREATE POLICY "Staff can update requests" 
ON public.clearance_requests FOR UPDATE 
USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid()
));
```

---

## Real-time Subscriptions

### Enable Real-time for Tables

```sql
-- Enable real-time for clearance_requests
ALTER TABLE public.clearance_requests REPLICA IDENTITY FULL;

-- Enable real-time for clearance_status
ALTER TABLE public.clearance_status REPLICA IDENTITY FULL;

-- Enable real-time for comments
ALTER TABLE public.comments REPLICA IDENTITY FULL;
```

### Frontend Subscription Example

```javascript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

// Subscribe to clearance status changes
const subscription = supabase
  .channel('clearance-updates')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'clearance_status',
      filter: `request_id=eq.${requestId}`
    },
    (payload) => {
      console.log('Clearance status changed:', payload);
      // Update UI with new status
    }
  )
  .subscribe();

// Subscribe to new comments
const commentSubscription = supabase
  .channel('comment-updates')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'comments',
      filter: `request_id=eq.${requestId}`
    },
    (payload) => {
      console.log('New comment:', payload);
      // Add comment to UI
    }
  )
  .subscribe();

// Unsubscribe when component unmounts
subscription.unsubscribe();
```

---

## Storage Configuration

### Create Storage Buckets

```sql
-- Documents bucket for clearance documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('documents', 'documents', false);

-- Certificates bucket for issued certificates
INSERT INTO storage.buckets (id, name, public) 
VALUES ('certificates', 'certificates', false);

-- Avatars bucket for profile pictures
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true);
```

### Storage Policies

```sql
-- Documents bucket policies
CREATE POLICY "Authenticated users can upload documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'documents');

CREATE POLICY "Users can view their own documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Certificates bucket policies
CREATE POLICY "Only admins can upload certificates"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'certificates' 
    AND EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

CREATE POLICY "Students can view their own certificates"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'certificates');
```

---

## Integration with Node.js Backend

### Supabase Client Setup

```javascript
// config/supabase.js
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

module.exports = supabase;
```

### Authentication Service

```javascript
// services/auth.service.js
const supabase = require('../config/supabase');

class AuthService {
  // Sign up student
  async signUpStudent(studentData) {
    const { data, error } = await supabase.auth.signUp({
      email: studentData.email,
      password: studentData.password,
      options: {
        data: {
          user_type: 'student',
          registration_number: studentData.registrationNumber,
          first_name: studentData.firstName,
          last_name: studentData.lastName,
          university_email: studentData.universityEmail,
          phone: studentData.phone,
          department_id: studentData.departmentId,
          program: studentData.program,
          discipline: studentData.discipline,
          batch: studentData.batch
        }
      }
    });

    if (error) throw error;
    return data;
  }

  // Sign up staff
  async signUpStaff(staffData) {
    const { data, error } = await supabase.auth.signUp({
      email: staffData.email,
      password: staffData.password,
      options: {
        data: {
          user_type: 'staff',
          first_name: staffData.firstName,
          last_name: staffData.lastName,
          role: staffData.role,
          department_id: staffData.departmentId,
          phone: staffData.phone
        }
      }
    });

    if (error) throw error;
    return data;
  }

  // Sign in
  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    return data;
  }

  // Sign out
  async signOut(token) {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { success: true };
  }

  // Get user by token
  async getUser(token) {
    const { data, error } = await supabase.auth.getUser(token);
    if (error) throw error;
    return data;
  }

  // Reset password
  async resetPassword(email) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.FRONTEND_URL}/reset-password`
    });
    if (error) throw error;
    return data;
  }
}

module.exports = new AuthService();
```

### Database Service

```javascript
// services/database.service.js
const supabase = require('../config/supabase');

class DatabaseService {
  // Get clearance requests with filters
  async getClearanceRequests(filters = {}) {
    let query = supabase
      .from('clearance_requests')
      .select(`
        *,
        student:student_id(*),
        clearance_status(*, department:department_id(*))
      `);

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.studentId) {
      query = query.eq('student_id', filters.studentId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  // Update clearance status
  async updateClearanceStatus(requestId, departmentId, updates) {
    const { data, error } = await supabase
      .from('clearance_status')
      .update({
        status: updates.status,
        remarks: updates.remarks,
        cleared_by: updates.clearedBy,
        cleared_at: updates.status === 'cleared' ? new Date().toISOString() : null,
        due_amount: updates.dueAmount,
        updated_at: new Date().toISOString()
      })
      .eq('request_id', requestId)
      .eq('department_id', departmentId)
      .select();

    if (error) throw error;
    return data;
  }

  // Add comment
  async addComment(requestId, commentData) {
    const { data, error } = await supabase
      .from('comments')
      .insert({
        request_id: requestId,
        author_id: commentData.authorId,
        author_type: commentData.authorType,
        author_name: commentData.authorName,
        message: commentData.message,
        is_internal: commentData.isInternal
      })
      .select();

    if (error) throw error;
    return data;
  }

  // Upload file
  async uploadFile(bucket, path, file) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;
    return data;
  }

  // Get file URL
  async getFileUrl(bucket, path) {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);

    return data.publicUrl;
  }
}

module.exports = new DatabaseService();
```

---

## Frontend Integration

### Supabase Client Setup

```javascript
// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Auth helper functions
export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
};

export const getUserProfile = async (userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return data;
};

export const getStudentProfile = async (userId) => {
  const { data, error } = await supabase
    .from('student_profiles')
    .select('*, department:department_id(*)')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return data;
};
```

### React Hook for Real-time Updates

```javascript
// src/hooks/useClearanceRealtime.js
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export const useClearanceRealtime = (requestId) => {
  const [statusUpdates, setStatusUpdates] = useState([]);

  useEffect(() => {
    if (!requestId) return;

    const subscription = supabase
      .channel(`clearance-${requestId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'clearance_status',
          filter: `request_id=eq.${requestId}`
        },
        (payload) => {
          setStatusUpdates(prev => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [requestId]);

  return statusUpdates;
};
```

---

## Migration Guide

### From MongoDB to Supabase

1. **Export data from MongoDB:**
```bash
mongoexport --db university_clearance --collection students --out students.json
mongoexport --db university_clearance --collection departments --out departments.json
mongoexport --db university_clearance --collection clearancerequests --out requests.json
```

2. **Transform data format:**
```javascript
// migration/transform.js
const fs = require('fs');

const students = JSON.parse(fs.readFileSync('students.json'));
const transformedStudents = students.map(s => ({
  registration_number: s.registrationNumber,
  first_name: s.firstName,
  last_name: s.lastName,
  email: s.email,
  // ... map other fields
}));

fs.writeFileSync('students_transformed.json', JSON.stringify(transformedStudents));
```

3. **Import to Supabase:**
```bash
# Using supabase CLI
supabase db seed run --file students_transformed.json
```

4. **Update application code:**
- Replace Mongoose models with Supabase queries
- Update authentication to use Supabase Auth
- Implement real-time subscriptions

---

## Security Best Practices

1. **Never expose Service Role Key on frontend**
2. **Use Row Level Security for all tables**
3. **Validate all inputs before sending to Supabase**
4. **Use prepared statements (automatic with Supabase client)**
5. **Enable email confirmations for new accounts**
6. **Implement rate limiting on your backend**
7. **Regularly rotate API keys**
8. **Monitor authentication logs**

---

*Last Updated: April 2024*