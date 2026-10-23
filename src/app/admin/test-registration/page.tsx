"use client";
import { FormEvent, useState } from "react";
export default function AdminTestRegistration() {
 const [email,setEmail]=useState("");
 const [intent,setIntent]=useState<"login"|"register">("login");
 const [otp,setOtp]=useState("");
 const [error,setError]=useState("");
 const [busy,setBusy]=useState(false);
 async function submit(event:FormEvent) {
  event.preventDefault();setBusy(true);setError("");setOtp("");
  try {
   const response=await fetch("/api/admin/test-registration",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"send",email,intent})});
   const result=await response.json();
   if(!response.ok) throw new Error(result.error||"Request failed");
   setOtp(result.code);
  } catch(err){setError(err instanceof Error?err.message:"Request failed");}
  finally{setBusy(false);}
 }
 return <main className="mx-auto max-w-lg p-8">
  <h1 className="mb-4 text-2xl font-bold">Admin OTP Testing</h1>
  <p className="mb-4 text-sm text-gray-600">Generate a test OTP for an approved test user. No email is sent. The user enters the code on their own phone. Disable this feature after testing.</p>
  <form onSubmit={submit} className="space-y-4">
   <label className="block">OTP for
    <select className="mt-1 w-full rounded border p-2" value={intent} onChange={e=>{setIntent(e.target.value as "login"|"register");setOtp("");}}>
     <option value="login">Existing user — Login</option>
     <option value="register">New user — Registration</option>
    </select>
   </label>
   <label className="block">Test email
    <input className="mt-1 w-full rounded border p-2" type="email" required value={email} onChange={e=>{setEmail(e.target.value);setOtp("");}} />
   </label>
   {error&&<p role="alert" className="text-red-700">{error}</p>}
   {otp&&<p className="rounded bg-gray-100 p-3">Screen OTP: <strong>{otp}</strong> (valid 10 minutes). Share privately with the test user. They should select {intent==="login"?"Login":"Register"} and use the manual test OTP option.</p>}
   <button className="rounded bg-blue-700 px-5 py-2 text-white" disabled={busy} type="submit">{busy?"Please wait...":"Generate screen OTP"}</button>
  </form>
 </main>;
}
