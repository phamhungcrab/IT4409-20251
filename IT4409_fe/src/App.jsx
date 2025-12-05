import { useState } from 'react'
import reactLogo from './assets/react.svg'
import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ProtectedRoute } from './router/protectedRoute';
import { CMSHome } from './pages/(admin)/CMSHome';
import { CMSLogin } from './pages/(admin)/CMSLogin';
import { CMSClass } from './pages/(admin)/CMSClass';
import { CMSExam } from './pages/(admin)/CMSExam';
import { CMSQuestions } from './pages/(admin)/CMSQuestion';
import { CMSResults } from './pages/(admin)/CMSResult';
import { Layout } from './layouts/(admin)/Layout';
import { CMSAccounts } from './pages/(admin)/CMSAccount';
import { CMSSubject } from './pages/(admin)/CMSSubject';
import { CMSSignup } from './pages/(admin)/CMSSignup';
import { CMSStudents } from './pages/(admin)/CMSStudents';


function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin/login" element={<CMSLogin />} />
        <Route path="/admin/signup" element={<CMSSignup />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index path="home" element={<CMSHome />} />
          <Route path="accounts" element={<CMSAccounts />} />
          <Route path="class" element={<CMSClass />} />
          <Route path="exam" element={<CMSExam />} />
          <Route path="questions" element={<CMSQuestions />} />
          <Route path="results/:examId" element={<CMSResults />} />
          <Route path="subject" element={<CMSSubject />} />
          <Route path="class/students" element={<CMSStudents />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
