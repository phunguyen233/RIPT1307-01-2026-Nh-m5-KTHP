import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import ShopProducts from './pages/ShopProducts';
import About from './pages/About';
import Contact from './pages/Contact';
import Branches from './pages/Branches';
import Cart from './pages/Cart';
import Auth from './pages/Auth';
import OrderHistory from './pages/OrderHistory';

function App() {
  return (
    <BrowserRouter>
      <div className="App min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<ShopProducts />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/branches" element={<Branches />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/orders-history" element={<OrderHistory />} />
            <Route path="/auth/*" element={<Auth />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
