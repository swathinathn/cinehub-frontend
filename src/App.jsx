import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Movies from "./pages/Movies";
import MovieDetails from "./pages/MovieDetails";
import SeatLayout from "./pages/SeatLayout";
import SearchResults from "./pages/SearchResults";
import MyBookings from "./pages/MyBookings";
import ScrollToTop from "./components/ScrollToTop";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./admin/AdminLayout";
import AdminDashboard from "./admin/AdminDashboard";
import AdminMovies from "./admin/AdminMovies";
import AdminBookings from "./admin/AdminBookings";
import AdminUsers from "./admin/AdminUsers";
import AdminShowtimes from "./admin/AdminShowtimes";
import AdminProtectedRoute from "./admin/AdminProtectedRoute";
import Profile from "./pages/Profile";
import Wishlist from "./pages/Wishlist";

function MainLayout() {
  return (
    <>
      <Navbar />
      <div className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/movies" element={<Movies />} />
          <Route path="/movies/:id" element={<MovieDetails />} />
          <Route path="/book/:id" element={
            <ProtectedRoute><SeatLayout /></ProtectedRoute>
          } />
          <Route path="/profile" element={<Profile />} />
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/wishlist" element={<Wishlist />} />
        </Routes>
      </div>
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Admin routes - protected */}
        <Route path="/admin" element={
          <AdminProtectedRoute>
            <AdminLayout />
          </AdminProtectedRoute>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="movies" element={<AdminMovies />} />
          <Route path="bookings" element={<AdminBookings />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="showtimes" element={<AdminShowtimes />} />
        </Route>

        {/* Main routes */}
        <Route path="/*" element={<MainLayout />} />
      </Routes>
    </>
  );
}