"use client";

import React, { useEffect, useState } from "react";
  // import TermsAndConditions from "@/components/TermsAndConditions";
import { useRouter, useParams } from "next/navigation";

export default function RegisterEventPage() {
  const router = useRouter();
  const { id } = useParams();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [tickets, setTickets] = useState("");
  const [amount, setAmount] = useState(0);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [ticketPrice, setTicketPrice] = useState(0);
  const [ticketAlert, setTicketAlert] = useState("");
  const [captcha, setCaptcha] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");
  const [captchaError, setCaptchaError] = useState("");
  const [showTnC, setShowTnC] = useState<boolean>(false);
    const [refreshing, setRefreshing] = useState(false);

  const [touched, setTouched] = useState({
    name: false,
    email: false,
    phone: false,
    tickets: false,
    captcha: false,
  });

  // Fetch ticket price from backend (event details)
  useEffect(() => {
    async function fetchEventDetails() {
      try {
        const res = await fetch(`/api/events/${id}`);
        if (res.ok) {
          const data = await res.json();
          setTicketPrice(data.price || 0);
          setAmount((data.price || 0) * Number(tickets));
        }
      } catch (err) {
        // Optionally handle error
      }
    }
    if (id) fetchEventDetails();
    // eslint-disable-next-line
  }, [id, tickets]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptTerms) {
      setError("You must accept the terms and conditions.");
      return;
    }
    if (captchaInput.trim().toUpperCase() !== captcha) {
      setCaptchaError("Captcha code does not match.");
      return;
    } else {
      setCaptchaError("");
    }
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      // Here you would call your backend to create a payment intent and register
      const res = await fetch(`/api/events/${id}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, tickets: Number(tickets), amount }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Registration failed");
      }
      setSuccess("Registration successful! Proceed to payment.");
      setName("");
      setEmail("");
      setPhone("");
      setTickets("");
      setAmount(ticketPrice);
      setAcceptTerms(false);
      // Optionally redirect or update UI
    }
    catch (err: any) {
      setError(err.message);
    }
    finally {
      setLoading(false);
    }
  };

  // Handle ticket count and amount calculation
  const handleTicketsChange = (value: string) => {
    setTicketAlert("");
    setTickets(value);
    const num = Number(value);
    if (isNaN(num) || num < 1) {
      setTicketAlert("Please enter a valid number of tickets (minimum 1)");
      setAmount(0);
    } else {
      setAmount(num * ticketPrice);
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-50">
      <div className="max-w-[900px] w-full mx-auto p-2 sm:p-6 bg-white rounded shadow relative">
        <div className={showTnC ? "blur-sm pointer-events-none select-none" : ""}>
          <h1 className="text-base sm:text-xl font-bold mb-4 text-center leading-tight">Register for Event</h1>
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            {/* Name */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-8">
              <label className="block font-semibold whitespace-nowrap min-w-[100px] sm:min-w-[180px] mb-1 sm:mb-0 text-sm sm:text-base text-gray-800" htmlFor="name">
                Name <span className="text-red-600">*</span>
              </label>
              <div className="relative w-full">
                <input
                  id="name"
                  type="text"
                  className={`w-full border-0 border-b-2 px-0 py-2 rounded-none bg-transparent focus:outline-none pr-8 text-sm sm:text-base placeholder-gray-400 text-gray-900 ${touched.name && name ? 'border-green-600 focus:border-green-600' : 'border-gray-300 focus:border-blue-600'}`}
                  value={name}
                  onChange={e => setName(e.target.value)}
                  onBlur={() => setTouched(t => ({ ...t, name: true }))}
                  required
                  placeholder="Enter your name"
                  title="Name"
                />
                {touched.name && name && (
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-600 text-xl sm:text-2xl">&#10003;</span>
                )}
              </div>
            </div>
            {/* Email */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-8">
              <label className="block font-semibold whitespace-nowrap min-w-[100px] sm:min-w-[180px] mb-1 sm:mb-0 text-sm sm:text-base text-gray-800" htmlFor="email">
                Email <span className="text-red-600">*</span>
              </label>
              <div className="relative w-full">
                <input
                  id="email"
                  type="email"
                  className={`w-full border-0 border-b-2 px-0 py-2 rounded-none bg-transparent focus:outline-none pr-8 text-sm sm:text-base placeholder-gray-400 text-gray-900 ${touched.email && email ? 'border-green-600 focus:border-green-600' : 'border-gray-300 focus:border-blue-600'}`}
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onBlur={() => setTouched(t => ({ ...t, email: true }))}
                  required
                  placeholder="Enter your email"
                  title="Email"
                />
                {touched.email && email && (
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-600 text-xl sm:text-2xl">&#10003;</span>
                )}
              </div>
            </div>
            {/* Phone */}
            <div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-8">
                <label className="block font-semibold whitespace-nowrap min-w-[100px] sm:min-w-[180px] mb-1 sm:mb-0 text-sm sm:text-base text-gray-800" htmlFor="phone">
                  Phone Number <span className="text-red-600">*</span>
                </label>
                <div className="w-full flex flex-row relative gap-2">
                  <select
                    id="country-code"
                    className="border rounded-l px-2 py-2 bg-gray-100 text-gray-700 text-sm sm:text-base"
                    value={countryCode}
                    onChange={e => setCountryCode(e.target.value)}
                    style={{ minWidth: "80px" }}
                    title="Country Code"
                  >
                    {/* ...country code options... */}
                    <option value="+91">+91</option>
                    <option value="+1">+1</option>
                    <option value="+44">+44</option>
                    {/* ...other options... */}
                  </select>
                  <input
                    id="phone"
                    type="tel"
                    className={`w-full border-0 border-b-2 px-0 py-2 rounded-none bg-transparent focus:outline-none pr-8 text-sm sm:text-base placeholder-gray-400 text-gray-900 ${touched.phone && phone ? 'border-green-600 focus:border-green-600' : 'border-gray-300 focus:border-blue-600'}`}
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    onBlur={() => setTouched(t => ({ ...t, phone: true }))}
                    required
                    placeholder="Enter your phone number"
                    title="Phone Number"
                    pattern="[0-9]{7,15}"
                    maxLength={15}
                  />
                  {touched.phone && phone && (
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-600 text-xl sm:text-2xl">&#10003;</span>
                  )}
                </div>
              </div>
            </div>
            {/* Tickets */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-8">
              <label className="block font-semibold whitespace-nowrap min-w-[100px] sm:min-w-[180px] mb-1 sm:mb-0 text-sm sm:text-base text-gray-800" htmlFor="tickets">
                Number of Tickets <span className="text-red-600">*</span>
              </label>
              <div className="relative w-full">
                <input
                  id="tickets"
                  type="number"
                  min={1}
                  className={`w-full border-0 border-b-2 px-0 py-2 rounded-none bg-transparent focus:outline-none pr-8 text-sm sm:text-base placeholder-gray-400 text-gray-900 ${touched.tickets && tickets && Number(tickets) > 0 ? 'border-green-600 focus:border-green-600' : 'border-gray-300 focus:border-blue-600'}`}
                  value={tickets}
                  onChange={e => handleTicketsChange(e.target.value)}
                  onBlur={() => setTouched(t => ({ ...t, tickets: true }))}
                  required
                  placeholder="Number of tickets"
                  title="Number of Tickets"
                />
                {touched.tickets && tickets && Number(tickets) > 0 && (
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-600 text-xl sm:text-2xl">&#10003;</span>
                )}
                {ticketAlert && <div className="text-red-600 text-xs sm:text-sm mt-1 font-medium">{ticketAlert}</div>}
              </div>
            </div>
            {/* Amount */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-8">
              <label className="block font-semibold whitespace-nowrap min-w-[100px] sm:min-w-[180px] mb-1 sm:mb-0 text-sm sm:text-base text-gray-800" htmlFor="amount">
                Total Payable Amount <span className="text-red-600">*</span>
              </label>
              <input
                id="amount"
                type="text"
                className="w-full border-0 border-b-2 border-gray-300 focus:border-blue-600 px-0 py-2 rounded-none bg-gray-100 focus:outline-none text-sm sm:text-base text-gray-900 font-semibold"
                value={`₹${Number(tickets) * ticketPrice}`}
                readOnly
                title="Total Payable Amount"
              />
            </div>
            {/* Captcha */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-8">
              <label className="block font-semibold whitespace-nowrap min-w-[100px] sm:min-w-[180px] mb-1 sm:mb-0 text-sm sm:text-base text-gray-800" htmlFor="captcha">
                Captcha <span className="text-red-600">*</span>
              </label>
              <div className="flex-1">
                <div className="relative mb-2">
                  <input
                    id="captcha"
                    type="text"
                    className={`w-full border-0 border-b-2 px-0 py-2 rounded-none bg-transparent focus:outline-none pr-8 text-sm sm:text-base placeholder-gray-400 text-gray-900 ${touched.captcha && captchaInput && captchaInput.trim().toUpperCase() === captcha ? 'border-green-600 focus:border-green-600' : 'border-gray-300 focus:border-blue-600'}`}
                    value={captchaInput}
                    onChange={e => setCaptchaInput(e.target.value)}
                    onBlur={() => setTouched(t => ({ ...t, captcha: true }))}
                    required
                    placeholder="Enter the captcha code below"
                    title="Captcha"
                    autoComplete="off"
                  />
                  {touched.captcha && captchaInput && captchaInput.trim().toUpperCase() === captcha && (
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-600 text-xl sm:text-2xl">&#10003;</span>
                  )}
                  {captchaError && <div className="text-red-600 text-xs sm:text-sm mt-1 font-medium">{captchaError}</div>}
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono bg-gray-200 px-2 py-2 sm:px-3 rounded text-sm sm:text-base tracking-widest select-none">{captcha}</span>
                  <button
                    type="button"
                    className={
                      `text-blue-600 text-xs sm:text-sm font-semibold flex items-center transition-transform duration-500 ${refreshing ? 'animate-spin' : ''}`
                    }
                    onClick={() => {
                      setRefreshing(true);
                      setCaptcha((() => {
                        const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
                        let code = "";
                        for (let i = 0; i < 6; i++) {
                          code += chars.charAt(Math.floor(Math.random() * chars.length));
                        }
                        return code;
                      })());
                      setTimeout(() => setRefreshing(false), 700);
                    }}
                    aria-label="Refresh Captcha"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.93 4.93a10 10 0 0114.14 0m0 0V1m0 3.93H17m-1.07 13.07a10 10 0 01-14.14 0m0 0V23m0-3.93H7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            {/* Terms and Conditions */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-4">
              <input
                type="checkbox"
                id="terms"
                checked={acceptTerms}
                onChange={e => setAcceptTerms(e.target.checked)}
                className="mr-2 mt-1 sm:mt-0 accent-blue-600"
                required
                title="Accept Terms and Conditions"
              />
              <label htmlFor="terms" className="text-xs sm:text-xs mb-1 sm:mb-0 font-medium text-gray-700">
                I accept the{' '}
                <button
                  type="button"
                  className="underline text-blue-600 hover:text-blue-800 focus:outline-none text-xs sm:text-xs font-semibold"
                  onClick={() => setShowTnC(true)}
                >
                  terms and conditions
                </button>{' '}
                <span className="text-red-600">*</span>
              </label>
            </div>
            {error && <div className="text-red-600 text-xs sm:text-xs font-medium mt-1">{error}</div>}
            {success && <div className="text-green-600 text-xs sm:text-xs font-medium mt-1">{success}</div>}
            <button
              type="submit"
              className={`w-full py-2 rounded text-xs sm:text-sm font-bold tracking-wide transition-colors duration-200 ${
                name && email && phone && tickets && captchaInput && acceptTerms && !loading
                  ? "bg-blue-600 text-white hover:bg-blue-700 focus:bg-blue-700"
                  : "bg-gray-400 text-white cursor-not-allowed"
              }`}
              disabled={
                !name || !email || !phone || !tickets || !captchaInput || !acceptTerms || loading
              }
            >
              {loading ? "Processing..." : "Pay Now & Register"}
            </button>
          </form>
        </div>
        {showTnC && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-2 sm:px-0">
            {/* Overlay for blur */}
            <div className="absolute inset-0 bg-blur bg-opacity-40 z-10" />
            {/* Modal content */}
            <div className="bg-white rounded shadow-lg max-w-lg w-full p-3 sm:p-6 relative z-20 text-xs sm:text-base">
              <button
                type="button"
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-2xl font-bold focus:outline-none"
                onClick={() => setShowTnC(false)}
                aria-label="Close Terms and Conditions"
              >
                &times;
              </button>
              <TermsAndConditions />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
