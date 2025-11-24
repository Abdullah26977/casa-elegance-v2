import React, { useState, useEffect, useContext, createContext, useMemo } from 'react';
import { 
  ShoppingBag, Search, Menu, X, Star, ArrowRight, Upload, 
  Check, Truck, Package, User, Heart, Play, ChevronRight, 
  Instagram, Facebook, Twitter, ShieldCheck, MapPin, Loader,
  Edit2, Trash2, Plus, Save, Image as ImageIcon, LayoutGrid, Monitor, ChevronLeft,
  LogOut, Mail, Bell, Home, Video, Settings, FileText, Layers, RefreshCw,
  Phone, Calendar, DollarSign, BarChart3, Users, ExternalLink, Info, Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, collection, getDocs, doc, setDoc, addDoc, query, where, updateDoc, deleteDoc } from 'firebase/firestore';

// ==========================================
// 1. CONFIGURATION & DATA
// ==========================================

const firebaseConfig = {
  apiKey: "AIzaSyCCGLdTjI0Wja6Z-wPGRQpFfLzdeH-xoGQ",
  authDomain: "casa-elegance.firebaseapp.com",
  projectId: "casa-elegance",
  storageBucket: "casa-elegance.firebasestorage.app",
  messagingSenderId: "393508968730",
  appId: "1:393508968730:web:b075d1277b5e1cf396b4a3",
  measurementId: "G-KFTDMCRF4Q"
};

let db, auth;
try {
   const app = initializeApp(firebaseConfig);
   db = getFirestore(app);
   auth = getAuth(app);
} catch (e) {
  console.log("Firebase not configured, running in MOCK MODE");
}

const INITIAL_CATEGORIES = [
  { id: 'all', name: 'View All', image: '' },
  { id: 'furniture', name: 'Furniture', image: 'https://images.unsplash.com/photo-1531835551805-16d864c8d311?auto=format&fit=crop&q=80&w=800' },
  { id: 'illumination', name: 'Illumination', image: 'https://images.unsplash.com/photo-1513506003013-453c47d7e601?auto=format&fit=crop&q=80&w=800' },
  { id: 'textiles', name: 'Textiles', image: 'https://images.unsplash.com/photo-1528458909336-e7a0adfed0a5?auto=format&fit=crop&q=80&w=800' },
  { id: 'decor', name: 'Decor', image: 'https://images.unsplash.com/photo-1581539250439-c96689b516dd?auto=format&fit=crop&q=80&w=800' },
  { id: 'smart-blinds', name: 'Smart Blinds', image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=800' }
];

const MOCK_PRODUCTS = [
  { 
    id: 1, 
    name: 'The Chesterfield Velvet Sofa', 
    price: 896000, 
    category: 'furniture',
    style: 'Classical', 
    images: [
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1550226891-ef816aed4a98?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&q=80&w=800'
    ], 
    rating: 4.9, 
    reviews: 128,
    description: 'Hand-tufted deep charcoal velvet with reclaimed oak legs.',
    richDescription: {
        story: "Inspired by the grand libraries of 19th-century London, this piece brings history into the modern home.",
        materials: "100% Cotton Velvet, Kiln-dried Oak Frame.",
        care: "Vacuum regularly using a soft brush attachment.",
        dimensions: "W: 240cm x D: 95cm x H: 75cm"
    }
  },
  { 
    id: 2, 
    name: 'Orbital Brass Chandelier', 
    price: 406000, 
    category: 'illumination',
    style: 'Modern', 
    images: [
      'https://images.unsplash.com/photo-1543198126-a8ad8e47fb22?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1513506003013-453c47d7e601?auto=format&fit=crop&q=80&w=800'
    ], 
    rating: 4.8, 
    reviews: 85, 
    description: 'A celestial arrangement of antiqued brass rings.',
    richDescription: {
        story: "A tribute to the atomic age, reimagined with the warmth of antiqued brass.",
        materials: "Solid Brass, Hand-blown Opal Glass.",
        care: "Dust with a soft, dry cloth.",
        dimensions: "Dia: 80cm x Drop: 120cm"
    } 
  },
  { 
    id: 3, 
    name: 'Persian Silk Runner', 
    price: 249000, 
    category: 'textiles',
    style: 'Bohemian', 
    images: [
      'https://images.unsplash.com/photo-1575909812264-79fd23b13dc3?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1600166898405-da9535204843?auto=format&fit=crop&q=80&w=800'
    ], 
    rating: 5.0, 
    reviews: 42,
    description: 'Hand-woven in Kashan, featuring ancient geometric motifs.',
    richDescription: {
        story: "Woven by artisans in the mountains of Kashan, each knot tells a story of tradition.",
        materials: "100% Mulberry Silk, Organic Vegetable Dyes.",
        care: "Professional rug clean only.",
        dimensions: "L: 300cm x W: 80cm"
    } 
  }
];

const INITIAL_SITE_CONTENT = {
  hero: {
    subtitle: "Est. 2025 • Casa Elegance",
    title: "Curated Living \n for the Modern Soul",
    buttonText: "Explore Collection",
    image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=2000",
    videoUrl: "", 
  },
  featuredVideo: {
    title: "Experience the Mood",
    subtitle: "Cinematic Living",
    description: "Immerse yourself in spaces designed for serenity and sophistication.",
    videoUrl: "https://joy1.videvo.net/videvo_files/video/free/2019-09/large_watermarked/190828_27_Supermarket_music_08_preview.mp4", 
    ctaText: "Shop The Look"
  }
};

// ==========================================
// 2. STORE CONTEXT
// ==========================================

const StoreContext = createContext();

const StoreProvider = ({ children }) => {
  // State
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [wishlist, setWishlist] = useState([]);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState(MOCK_PRODUCTS);
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [siteContent, setSiteContent] = useState(INITIAL_SITE_CONTENT);
  const [user, setUser] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStyle, setSelectedStyle] = useState('all'); 
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [notification, setNotification] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [subscribers, setSubscribers] = useState([]);

  // --- FIREBASE SYNC ON LOAD ---
  useEffect(() => {
    if (!db) return; // Only run if Firebase is connected

    const fetchData = async () => {
      try {
        // 1. Get Products
        const productsSnapshot = await getDocs(collection(db, "products"));
        const dbProducts = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if (dbProducts.length > 0) setProducts(dbProducts);

        // 2. Get Categories
        const catSnapshot = await getDocs(collection(db, "categories"));
        const dbCategories = catSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if (dbCategories.length > 0) setCategories(dbCategories);

        // 3. Get Orders
        const orderSnapshot = await getDocs(collection(db, "orders"));
        const dbOrders = orderSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setOrders(dbOrders);
        
        // 4. Get Subscribers (if admin)
        // Ideally this should be behind admin check
        const subSnapshot = await getDocs(collection(db, "subscribers"));
        const dbSubs = subSnapshot.docs.map(doc => doc.data());
        setSubscribers(dbSubs);

      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // --- CART ACTIONS ---
  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { ...product, qty: 1 }];
    });
    setCartOpen(true);
    showNotification(`Added ${product.name} to bag`);
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateCartQty = (id, delta) => {
      setCart(prev => prev.map(item => {
          if (item.id === id) {
              const newQty = item.qty + delta;
              return newQty > 0 ? { ...item, qty: newQty } : item;
          }
          return item;
      }));
  };

  const toggleWishlist = (product) => {
    setWishlist(prev => {
      const exists = prev.find(item => item.id === product.id);
      if (exists) {
        showNotification("Removed from wishlist", "info");
        return prev.filter(item => item.id !== product.id);
      }
      showNotification("Saved to wishlist");
      return [...prev, product];
    });
  };

  const cartTotal = useMemo(() => {
    return cart.reduce((total, item) => total + (item.price * item.qty), 0);
  }, [cart]);


  // --- DATABASE ACTIONS ---

  const addOrder = async (orderData) => {
    setOrders(prev => [orderData, ...prev]);
    if (db) {
      try {
        await setDoc(doc(db, "orders", orderData.id), orderData);
      } catch (e) {
        console.error("Error saving order: ", e);
      }
    }
  };

  const addSubscriber = async (email) => {
    if (db) {
        try {
            await addDoc(collection(db, "subscribers"), { email, date: new Date().toISOString() });
            setSubscribers(prev => [...prev, { email, date: new Date().toISOString() }]);
        } catch(e) { console.error(e); }
    }
    showNotification("Welcome to the Inner Circle!");
  };

  const addProduct = async (product) => {
      setIsLoading(true);
      const newProduct = { ...product, id: Date.now().toString() };

      setProducts(prev => [newProduct, ...prev]);

      if (db) {
        try {
          await setDoc(doc(db, "products", newProduct.id), newProduct);
        } catch (e) {
          console.error("Error adding product: ", e);
          showNotification("Error saving to database", "error");
        }
      }

      setIsLoading(false);
      showNotification("Product created successfully");
  };
  
  const updateProduct = async (id, updatedData) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updatedData } : p));
    if (db) {
      try {
        const productRef = doc(db, "products", id.toString());
        await updateDoc(productRef, updatedData);
      } catch (e) {
         console.error("Error updating product: ", e);
      }
    }
    showNotification("Product updated");
  };
  
  const deleteProduct = async (id) => {
      if(window.confirm("Are you sure you want to delete this product?")) {
        setProducts(prev => prev.filter(p => p.id !== id));
        if (db) {
          try {
            await deleteDoc(doc(db, "products", id.toString()));
          } catch (e) {
             console.error("Error deleting product: ", e);
          }
        }
        showNotification("Product deleted", "info");
      }
  };
  
  const addCategory = async (category) => {
    const id = category.name.toLowerCase().replace(/\s+/g, '-');
    const newCat = { ...category, id };
    
    setCategories(prev => [...prev, newCat]);

    if (db) {
        try {
            await setDoc(doc(db, "categories", id), newCat);
        } catch (e) { console.error(e); }
    }
    showNotification("Category added");
  };
  
  const deleteCategory = async (id) => {
      setCategories(prev => prev.filter(c => c.id !== id));
      if (db) {
          try {
              await deleteDoc(doc(db, "categories", id));
          } catch (e) { console.error(e); }
      }
      showNotification("Category removed", "info");
  };
  
  const updateSiteContent = (section, newData) => {
    setSiteContent(prev => ({
        ...prev,
        [section]: { ...prev[section], ...newData }
    }));
    showNotification("Site content updated");
  };

  // --- AUTH ACTIONS ---
  const login = async (email, name) => {
    setIsLoading(true);
    setTimeout(() => {
        setUser({ email, name, id: 'user-123', role: email.includes('admin') ? 'admin' : 'user' });
        setAuthModalOpen(false);
        setIsLoading(false);
        showNotification(`Welcome back, ${name}!`);
    }, 800);
  };

  const logout = () => {
    setUser(null);
    showNotification("Logged out successfully");
  };

  return (
    <StoreContext.Provider value={{ 
      cart, addToCart, removeFromCart, updateCartQty, cartOpen, setCartOpen, cartTotal, setCart,
      wishlist, toggleWishlist,
      products, addProduct, updateProduct, deleteProduct,
      categories, addCategory, deleteCategory,
      selectedCategory, setSelectedCategory,
      selectedStyle, setSelectedStyle,
      selectedProduct, setSelectedProduct,
      siteContent, updateSiteContent,
      orders, addOrder,
      user, setUser, login, logout, authModalOpen, setAuthModalOpen,
      searchQuery, setSearchQuery, isSearchOpen, setIsSearchOpen,
      notification, showNotification,
      isLoading,
      subscribers, addSubscriber
    }}>
      {children}
    </StoreContext.Provider>
  );
};

// ==========================================
// 3. PRIMITIVE COMPONENTS
// ==========================================

const Button = ({ children, onClick, variant = 'primary', className = '', disabled, ...props }) => {
  const baseStyle = "px-8 py-4 transition-all duration-300 font-medium tracking-widest uppercase text-xs flex items-center justify-center gap-2 rounded-none disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-neutral-900 text-white hover:bg-neutral-800 border border-neutral-900 shadow-sm hover:shadow-md",
    outline: "bg-transparent border border-neutral-300 text-neutral-900 hover:bg-neutral-900 hover:text-white hover:border-neutral-900",
    gold: "bg-amber-700 text-white hover:bg-amber-800 border border-amber-700",
    ghost: "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50",
    danger: "bg-red-50 text-red-600 hover:bg-red-100 border border-transparent"
  };

  return (
    <button onClick={onClick} disabled={disabled} className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

const Section = ({ title, subtitle, children, className = '', id = '' }) => (
  <section id={id} className={`py-24 px-4 md:px-12 max-w-[1920px] mx-auto ${className}`}>
    {(title || subtitle) && (
      <div className="text-center mb-16 max-w-2xl mx-auto animate-fade-in-up">
        {subtitle && <p className="text-amber-600 text-xs font-bold tracking-[0.2em] uppercase mb-3">{subtitle}</p>}
        {title && <h2 className="text-3xl md:text-5xl font-serif text-neutral-900">{title}</h2>}
        <div className="w-12 h-0.5 bg-neutral-200 mx-auto mt-6"></div>
      </div>
    )}
    {children}
  </section>
);

const NotificationToast = () => {
  const { notification } = useContext(StoreContext);
  if (!notification) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
      className="fixed bottom-8 right-8 bg-white border border-neutral-100 text-neutral-900 px-6 py-4 shadow-2xl z-[100] flex items-center gap-4 min-w-[300px]"
    >
      <div className={`rounded-full p-1 ${notification.type === 'success' ? 'text-green-600 bg-green-50' : 'text-blue-600 bg-blue-50'}`}>
        <Check size={16} />
      </div>
      <div>
        <p className="text-sm font-bold uppercase tracking-wide">{notification.type === 'success' ? 'Success' : 'Update'}</p>
        <p className="text-sm text-neutral-600">{notification.message}</p>
      </div>
    </motion.div>
  );
};

// ==========================================
// 4. SUB-COMPONENTS (Defined BEFORE use)
// ==========================================

const WelcomeScreen = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div 
      className="fixed inset-0 z-[100] bg-neutral-950 flex items-center justify-center"
      exit={{ y: '-100%', transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] } }}
    >
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          <h1 className="text-4xl md:text-6xl font-serif text-white tracking-tighter mb-4">
            CASA ELEGANCE
          </h1>
        </motion.div>
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: 1.5, delay: 1 }}
          className="h-[1px] bg-amber-500 mx-auto max-w-[200px]"
        />
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
          className="text-neutral-500 text-xs uppercase tracking-[0.4em] mt-4"
        >
          Luxury Defined
        </motion.p>
      </div>
    </motion.div>
  );
};

const ProductCard = ({ product }) => {
  const { addToCart, setSelectedProduct, toggleWishlist, wishlist } = useContext(StoreContext);
  const isWishlisted = wishlist.some(item => item.id === product.id);
  const displayImage = product.images && product.images.length > 0 ? product.images[0] : '';

  return (
    <motion.div 
      layout
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="group relative cursor-pointer bg-white"
      onClick={() => setSelectedProduct(product)}
    >
      <div className="relative overflow-hidden aspect-[4/5] mb-6 bg-neutral-100">
        <img 
          src={displayImage} 
          alt={product.name} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
        <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
            <button 
              onClick={(e) => { e.stopPropagation(); toggleWishlist(product); }}
              className="p-3 rounded-full bg-white text-neutral-900 hover:bg-neutral-900 hover:text-white transition-colors shadow-md"
            >
              <Heart size={18} className={isWishlisted ? "fill-red-500 text-red-500" : ""} />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); addToCart(product); }}
              className="p-3 rounded-full bg-white text-neutral-900 hover:bg-neutral-900 hover:text-white transition-colors shadow-md"
            >
              <ShoppingBag size={18} />
            </button>
        </div>
      </div>
      <div className="space-y-2 px-2 pb-4">
        <h3 className="text-lg font-serif text-neutral-900 leading-tight">{product.name}</h3>
        <p className="text-neutral-500 text-sm capitalize">{product.category} • {product.style}</p>
        <p className="text-amber-700 font-medium">PKR {product.price.toLocaleString()}</p>
      </div>
    </motion.div>
  );
};

const ProductDetailModal = () => {
  const { selectedProduct, setSelectedProduct, addToCart, toggleWishlist, wishlist } = useContext(StoreContext);
  const [currentImageIdx, setCurrentImageIdx] = useState(0);

  if (!selectedProduct) return null;

  const images = selectedProduct.images || [];
  const isWishlisted = wishlist.some(item => item.id === selectedProduct.id);
  const richDesc = selectedProduct.richDescription || { story: "A timeless piece.", materials: "Premium materials.", care: "Standard care.", dimensions: "Standard" };
  
  const isModern = selectedProduct.style === 'Modern' || selectedProduct.style === 'Industrial';
  const themeBg = isModern ? 'bg-neutral-900 text-white' : 'bg-[#fdfbf7] text-neutral-900';
  const themeBorder = isModern ? 'border-white/20' : 'border-neutral-200';
  const themeAccent = isModern ? 'text-neutral-400' : 'text-amber-700';

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-md flex items-center justify-center p-0 md:p-8"
        onClick={() => setSelectedProduct(null)}
      >
        <motion.div 
          initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
          className={`w-full h-full md:h-[90vh] max-w-[1600px] flex flex-col md:flex-row overflow-hidden shadow-2xl ${themeBg}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-full md:w-[55%] relative h-[40vh] md:h-full bg-black">
            <img 
              src={images[currentImageIdx]} 
              alt={selectedProduct.name} 
              className="w-full h-full object-cover opacity-95"
            />
            {images.length > 1 && (
              <div className="absolute bottom-8 left-8 right-8 flex justify-center gap-3">
                {images.map((_, idx) => (
                    <button 
                        key={idx}
                        onClick={() => setCurrentImageIdx(idx)}
                        className={`h-1 transition-all duration-300 ${idx === currentImageIdx ? 'w-8 bg-white' : 'w-4 bg-white/40 hover:bg-white/70'}`}
                    />
                ))}
              </div>
            )}
            <button 
                className="absolute top-8 left-8 md:hidden text-white drop-shadow-md"
                onClick={() => setSelectedProduct(null)}
            >
                <X size={32} />
            </button>
          </div>

          <div className={`w-full md:w-[45%] flex flex-col h-full overflow-y-auto custom-scrollbar`}>
            <div className="p-8 md:p-16 flex-1">
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <p className={`text-xs font-bold tracking-[0.2em] uppercase mb-2 ${themeAccent}`}>{selectedProduct.style} Collection</p>
                        <h2 className="text-4xl md:text-5xl font-serif leading-tight">{selectedProduct.name}</h2>
                    </div>
                    <button onClick={() => setSelectedProduct(null)} className="hidden md:block opacity-50 hover:opacity-100 transition-opacity">
                        <X size={32} />
                    </button>
                </div>

                <div className={`flex items-center gap-6 mb-12 pb-8 border-b ${themeBorder}`}>
                    <span className="text-3xl font-light">PKR {selectedProduct.price.toLocaleString()}</span>
                    <div className="flex items-center gap-1 text-amber-500">
                        <Star size={18} fill="currentColor" />
                        <span className={`ml-2 text-xs tracking-wider ${isModern ? 'text-neutral-400' : 'text-neutral-600'}`}>({selectedProduct.rating})</span>
                    </div>
                </div>

                <div className="space-y-12 mb-16">
                    <div>
                        <h4 className="font-serif text-xl mb-4 opacity-90 italic">The Design Story</h4>
                        <p className={`leading-relaxed text-lg font-light opacity-80`}>{richDesc.story}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                        <div>
                            <h5 className="font-bold uppercase text-xs tracking-widest mb-3 opacity-60 flex items-center gap-2"><Layers size={14}/> Materials</h5>
                            <p className="text-sm opacity-80 leading-relaxed">{richDesc.materials}</p>
                        </div>
                        <div>
                            <h5 className="font-bold uppercase text-xs tracking-widest mb-3 opacity-60 flex items-center gap-2"><RefreshCw size={14}/> Care</h5>
                            <p className="text-sm opacity-80 leading-relaxed">{richDesc.care}</p>
                        </div>
                        {richDesc.dimensions && (
                            <div className="sm:col-span-2">
                                <h5 className="font-bold uppercase text-xs tracking-widest mb-3 opacity-60 flex items-center gap-2"><Settings size={14}/> Dimensions</h5>
                                <p className="text-sm opacity-80 leading-relaxed font-mono">{richDesc.dimensions}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className={`p-8 border-t ${themeBorder} sticky bottom-0 ${isModern ? 'bg-neutral-900' : 'bg-[#fdfbf7]'}`}>
                <div className="flex gap-4">
                    <Button 
                        onClick={() => { addToCart(selectedProduct); setSelectedProduct(null); }} 
                        className={`flex-1 py-5 text-sm ${isModern ? 'bg-white text-black hover:bg-neutral-200' : 'bg-neutral-900 text-white'}`}
                    >
                        Add to Sanctuary
                    </Button>
                    <button 
                        onClick={() => toggleWishlist(selectedProduct)}
                        className={`px-6 border ${themeBorder} hover:border-current transition-colors`}
                    >
                        <Heart size={24} fill={isWishlisted ? "currentColor" : "none"} className={isWishlisted ? "text-red-500" : ""} />
                    </button>
                </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const AuthModal = () => {
  const { authModalOpen, setAuthModalOpen, login, isLoading } = useContext(StoreContext);
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });

  if (!authModalOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setAuthModalOpen(false)} />
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white w-full max-w-md relative z-10 p-8 rounded-xl shadow-2xl"
      >
        <button onClick={() => setAuthModalOpen(false)} className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-900"><X size={20} /></button>
        <h2 className="text-3xl font-serif text-center mb-2">{isRegister ? 'Join Casa' : 'Welcome Back'}</h2>
        <p className="text-center text-neutral-500 mb-8 text-sm">{isRegister ? 'Create an account to unlock exclusive benefits.' : 'Sign in to access your wishlist and orders.'}</p>
        <div className="space-y-4">
          {isRegister && (
            <input 
              placeholder="Full Name" 
              className="w-full p-3 border border-neutral-200 rounded focus:border-neutral-900 outline-none"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          )}
          <input 
            type="email" 
            placeholder="Email Address" 
            className="w-full p-3 border border-neutral-200 rounded focus:border-neutral-900 outline-none"
            value={formData.email}
            onChange={e => setFormData({...formData, email: e.target.value})}
          />
          <input 
            type="password" 
            placeholder="Password" 
            className="w-full p-3 border border-neutral-200 rounded focus:border-neutral-900 outline-none"
            value={formData.password}
            onChange={e => setFormData({...formData, password: e.target.value})}
          />
          <Button 
            onClick={() => login(formData.email, isRegister ? formData.name : 'Valued Customer')} 
            className="w-full" 
            disabled={isLoading}
          >
              {isLoading ? 'Authenticating...' : (isRegister ? 'Create Account' : 'Sign In')}
          </Button>
        </div>
        <div className="mt-6 text-center text-sm">
          <span className="text-neutral-500">{isRegister ? 'Already have an account?' : 'New to Casa Elegance?'}</span>
          <button onClick={() => setIsRegister(!isRegister)} className="ml-2 font-medium underline hover:text-amber-600">
            {isRegister ? 'Sign In' : 'Create Account'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const SearchBar = () => {
  const { isSearchOpen, setIsSearchOpen, searchQuery, setSearchQuery } = useContext(StoreContext);

  return (
    <AnimatePresence>
      {isSearchOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
          className="absolute top-full left-0 w-full bg-white border-t border-neutral-100 shadow-lg p-4 z-40"
        >
          <div className="max-w-3xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
            <input 
              autoFocus
              placeholder="Search for sofas, lighting, decor..." 
              className="w-full pl-12 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-full focus:outline-none focus:border-neutral-900 transition-colors"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }} className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-900">
              <X size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const CartDrawer = () => {
  const { cart, cartOpen, setCartOpen, removeFromCart, cartTotal } = useContext(StoreContext);
  const handleCheckout = () => { setCartOpen(false); window.dispatchEvent(new CustomEvent('navigate', { detail: 'checkout' })); };
  return (
    <AnimatePresence>
      {cartOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setCartOpen(false)} className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm" />
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'tween', duration: 0.3 }} className="fixed right-0 top-0 h-full w-full md:w-[450px] bg-white z-[51] shadow-2xl flex flex-col">
            <div className="p-6 border-b border-neutral-100 flex justify-between items-center"><h2 className="font-serif text-xl">Shopping Bag ({cart.length})</h2><button onClick={() => setCartOpen(false)}><X size={24} /></button></div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6">{cart.map(item => <div key={item.id} className="flex gap-4"><img src={item.images[0]} alt="" className="w-20 h-24 object-cover bg-neutral-100" /><div className="flex-1"><div className="flex justify-between items-start"><h3 className="font-medium font-serif text-lg">{item.name}</h3><button onClick={() => removeFromCart(item.id)} className="text-neutral-400 hover:text-red-500"><X size={16} /></button></div><p className="text-neutral-500 text-sm mt-1">{item.category}</p><div className="flex justify-between items-center mt-4"><span className="text-neutral-400 text-sm">Qty: {item.qty}</span><span className="font-medium">PKR {(item.price * item.qty).toLocaleString()}</span></div></div></div>)}{cart.length === 0 && <p className="text-center text-neutral-400 mt-20">Your bag is empty.</p>}</div>
            <div className="p-6 bg-neutral-50 border-t border-neutral-100"><div className="flex justify-between mb-4 text-lg font-serif"><span>Subtotal</span><span>PKR {cartTotal.toLocaleString()}</span></div><Button onClick={handleCheckout} className="w-full" disabled={cart.length === 0}>Proceed to Checkout</Button></div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const Navbar = ({ onNavigate, cartCount, openCart }) => {
  const [scrolled, setScrolled] = useState(false);
  const { isSearchOpen, setIsSearchOpen, user, setAuthModalOpen } = useContext(StoreContext);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md text-neutral-900 shadow-sm py-4' : 'bg-transparent text-white py-6'}`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center relative">
        <div className="flex items-center gap-8">
          <button onClick={() => onNavigate('home')} className="font-serif text-2xl tracking-tight font-bold">CASA ELEGANCE</button>
          <div className="hidden md:flex gap-6 text-sm font-medium tracking-wide uppercase">
            <button onClick={() => onNavigate('home')} className="hover:text-amber-500 transition-colors flex items-center gap-1"><Home size={16}/> Home</button>
            <button onClick={() => onNavigate('shop')} className="hover:text-amber-500 transition-colors">Shop</button>
            <button onClick={() => onNavigate('visualizer')} className="hover:text-amber-500 transition-colors">Visualizer</button>
            <button onClick={() => onNavigate('track')} className="hover:text-amber-500 transition-colors">Track Order</button>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <button onClick={() => setIsSearchOpen(!isSearchOpen)} className={`transition-colors ${isSearchOpen ? 'text-amber-600' : 'hover:text-amber-500'}`}><Search size={20} /></button>
          <button onClick={() => user ? onNavigate('profile') : setAuthModalOpen(true)} className="hover:text-amber-500 relative"><User size={20} />{user && <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full" />}</button>
          <button onClick={openCart} className="relative hover:text-amber-500"><ShoppingBag size={20} />{cartCount > 0 && <span className="absolute -top-2 -right-2 bg-amber-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">{cartCount}</span>}</button>
        </div>
      </div>
      <SearchBar />
    </nav>
  );
};

const Hero = ({ navigate }) => {
  const { siteContent } = useContext(StoreContext);
  const { hero } = siteContent;

  return (
    <div className="relative h-screen w-full overflow-hidden">
      <div className="absolute inset-0 bg-neutral-900">
        <img 
          src={hero.image} 
          alt="Luxury Interior" 
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-transparent to-transparent" />
      </div>
      
      <div className="absolute inset-0 flex items-center justify-center text-center px-4">
        <div className="max-w-4xl space-y-6">
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-amber-400 tracking-[0.2em] uppercase text-sm font-medium"
          >
            {hero.subtitle}
          </motion.p>
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="text-5xl md:text-7xl lg:text-8xl font-serif text-white leading-tight whitespace-pre-line"
          >
            {hero.title}
          </motion.h1>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <Button variant="outline" className="border-white text-white hover:bg-white hover:text-neutral-900 mt-8" onClick={() => navigate('shop')}>
              {hero.buttonText}
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

const RoomVisualizer = () => {
  const [analyzing, setAnalyzing] = useState(false);
  const [image, setImage] = useState(null);
  const [results, setResults] = useState(null);
  const { products } = useContext(StoreContext);

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
      setResults(null);
    }
  };

  const startAnalysis = () => {
    if (!image) return;
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      const randomProducts = products.sort(() => 0.5 - Math.random()).slice(0, 3);
      setResults(randomProducts);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-neutral-50 pt-24 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-serif text-neutral-900 mb-4">AI Room Visualizer</h2>
          <p className="text-neutral-600 max-w-2xl mx-auto">Upload a photo of your space. Our intelligence engine analyzes lighting, dimensions, and palette to suggest the perfect additions.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-start">
          <div className="bg-white p-8 rounded-xl shadow-sm border border-neutral-100 min-h-[400px] flex flex-col items-center justify-center relative overflow-hidden group">
            {image ? (
              <>
                <img src={image} alt="Room" className="absolute inset-0 w-full h-full object-cover" />
                {analyzing && (
                  <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                    <Loader className="animate-spin mb-4" size={40} />
                    <p className="tracking-widest uppercase text-sm">Scanning Geometry...</p>
                  </div>
                )}
                {!analyzing && !results && (
                  <button onClick={startAnalysis} className="absolute bottom-8 bg-white text-neutral-900 px-8 py-3 rounded-full shadow-lg font-medium hover:scale-105 transition-transform">
                    Analyze Space
                  </button>
                )}
              </>
            ) : (
              <label className="cursor-pointer flex flex-col items-center text-neutral-400 hover:text-neutral-900 transition-colors">
                <Upload size={48} className="mb-4" />
                <span className="text-lg font-medium">Click to Upload Room Photo</span>
                <span className="text-sm mt-2">JPG or PNG (Max 5MB)</span>
                <input type="file" className="hidden" onChange={handleUpload} accept="image/*" />
              </label>
            )}
          </div>

          <div className="space-y-6">
            {!results ? (
              <div className="h-full flex flex-col items-center justify-center text-neutral-400 p-12 border-2 border-dashed border-neutral-200 rounded-xl">
                <p>AI suggestions will appear here</p>
              </div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h3 className="text-xl font-serif mb-6 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  Analysis Complete: <span className="text-neutral-500 text-base font-sans">Modern Minimalist Detected</span>
                </h3>
                <div className="space-y-4">
                  {results.map((product, idx) => {
                    const thumb = product.images && product.images.length > 0 ? product.images[0] : '';
                    return (
                      <motion.div 
                        key={product.id}
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: idx * 0.2 }}
                        className="flex gap-4 bg-white p-4 rounded-lg shadow-sm border border-neutral-100"
                      >
                        <img src={thumb} alt="" className="w-20 h-20 object-cover rounded" />
                        <div className="flex-1">
                          <h4 className="font-serif">{product.name}</h4>
                          <p className="text-sm text-neutral-500 mb-2">98% Match Score</p>
                          <div className="flex justify-between items-center">
                            <span className="font-medium">PKR {product.price.toLocaleString()}</span>
                            <button className="text-xs uppercase font-bold tracking-wider hover:text-amber-600">Add to Room</button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const UserProfile = ({ navigate }) => {
  const { user, logout, wishlist, orders } = useContext(StoreContext);

  if (!user) return <div className="pt-32 text-center">Please log in to view profile.</div>;

  return (
    <div className="pt-24 px-6 md:px-12 max-w-7xl mx-auto min-h-screen">
      <div className="flex justify-between items-center mb-12 border-b pb-6 border-neutral-100">
        <div>
          <h1 className="text-3xl font-serif mb-2">My Account</h1>
          <p className="text-neutral-500">Welcome back, {user.name}</p>
        </div>
        <Button variant="outline" onClick={() => { logout(); navigate('home'); }}>Sign Out</Button>
      </div>

      <div className="grid md:grid-cols-3 gap-12">
        <div className="md:col-span-2 space-y-12">
          <section>
            <h3 className="text-xl font-serif mb-6">My Wishlist ({wishlist.length})</h3>
            {wishlist.length === 0 ? (
              <p className="text-neutral-400">Your wishlist is empty.</p>
            ) : (
              <div className="grid grid-cols-2 gap-6">
                {wishlist.map(p => (
                  <div key={p.id} className="flex gap-4 border p-4 rounded relative">
                    <img src={p.images[0]} className="w-20 h-20 object-cover rounded bg-neutral-100" alt="" />
                    <div>
                      <h4 className="font-medium">{p.name}</h4>
                      <p className="text-sm text-neutral-500">PKR {p.price.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section>
            <h3 className="text-xl font-serif mb-6">Order History</h3>
            {orders.length === 0 ? (
              <div className="bg-neutral-50 p-8 text-center rounded border border-dashed border-neutral-200">
                <p className="text-neutral-500 mb-4">You haven't placed any orders yet.</p>
                <Button onClick={() => navigate('shop')}>Start Shopping</Button>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map(o => (
                  <div key={o.id} className="border p-4 rounded flex justify-between items-center">
                    <div>
                      <p className="font-bold text-sm">{o.id}</p>
                      <p className="text-xs text-neutral-500">{new Date(o.date).toLocaleDateString()}</p>
                    </div>
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">{o.status}</span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <div className="bg-neutral-50 p-6 rounded h-fit">
          <h3 className="font-bold mb-4">Account Details</h3>
          <div className="space-y-2 text-sm text-neutral-600">
            <p><span className="font-medium text-neutral-900">Email:</span> {user.email}</p>
            <p><span className="font-medium text-neutral-900">Member ID:</span> {user.id}</p>
            <p><span className="font-medium text-neutral-900">Region:</span> Pakistan</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const Checkout = ({ navigate }) => {
  const { cart, cartTotal, addOrder, setCart } = useContext(StoreContext);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', address: '', city: '', zip: '', card: '' });

  const handleChange = (e) => setFormData({...formData, [e.target.name]: e.target.value});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      const orderId = `CE-2025-${Math.floor(1000 + Math.random() * 9000)}`;
      const tracking = `TRK-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      addOrder({ id: orderId, tracking, items: cart, total: cartTotal, date: new Date().toISOString(), status: 'Processing', customer: formData });
      setCart([]);
      setLoading(false);
      alert(`Order Placed! Your Tracking ID is ${tracking}`);
      navigate('home');
    }, 2000);
  };

  if (cart.length === 0) return <div className="pt-32 text-center"><h2 className="text-2xl font-serif">Your cart is empty.</h2><Button className="mt-4" onClick={() => navigate('shop')}>Continue Shopping</Button></div>;

  return (
    <div className="pt-24 pb-12 px-4 bg-neutral-50 min-h-screen">
      <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <div className="bg-white p-8 shadow-sm rounded-sm">
            <h2 className="text-2xl font-serif mb-6">Secure Checkout</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <input required name="name" placeholder="Full Name" onChange={handleChange} className="p-3 border border-neutral-300 w-full outline-none" />
                <input required name="email" type="email" placeholder="Email" onChange={handleChange} className="p-3 border border-neutral-300 w-full outline-none" />
              </div>
              <input required name="address" placeholder="Address" onChange={handleChange} className="p-3 border border-neutral-300 w-full outline-none" />
              <div className="grid grid-cols-2 gap-4">
                <input required name="city" placeholder="City" onChange={handleChange} className="p-3 border border-neutral-300 w-full outline-none" />
                <input required name="zip" placeholder="ZIP" onChange={handleChange} className="p-3 border border-neutral-300 w-full outline-none" />
              </div>
              <div className="pt-6 border-t"><input required name="card" placeholder="Card Number" className="p-3 border border-neutral-300 w-full outline-none" /></div>
              <Button type="submit" disabled={loading} className="w-full">{loading ? 'Processing...' : `Pay PKR ${cartTotal.toLocaleString()}`}</Button>
            </form>
          </div>
        </div>
        <div className="bg-neutral-900 text-white p-8 h-fit">
          <h3 className="text-xl font-serif mb-6 text-amber-500">Order Summary</h3>
          <div className="space-y-4 mb-6">{cart.map(item => <div key={item.id} className="flex justify-between text-sm"><span>{item.qty}x {item.name}</span><span>PKR {(item.price * item.qty).toLocaleString()}</span></div>)}</div>
          <div className="border-t border-neutral-800 pt-4 flex justify-between font-serif text-xl"><span>Total</span><span>PKR {cartTotal.toLocaleString()}</span></div>
        </div>
      </div>
    </div>
  );
};

const OrderTracking = () => {
  const [orderId, setOrderId] = useState('');
  const [status, setStatus] = useState(null);
  const checkStatus = (e) => {
    e.preventDefault();
    setStatus({ id: orderId, steps: [{ label: 'Order Processed', date: 'Today', completed: true }, { label: 'Quality Check', date: 'Today', completed: true }, { label: 'Shipped', date: 'Pending', completed: false }, { label: 'Delivered', date: 'Pending', completed: false }] });
  };
  return (
    <div className="pt-32 pb-20 px-4 min-h-[60vh]">
      <div className="max-w-xl mx-auto text-center">
        <h2 className="text-3xl font-serif mb-8">Track Your Order</h2>
        <form onSubmit={checkStatus} className="flex gap-2 mb-12"><input value={orderId} onChange={(e) => setOrderId(e.target.value)} placeholder="Order ID" className="flex-1 p-4 border uppercase tracking-widest" /><Button type="submit">Track</Button></form>
        {status && <div className="text-left bg-white p-8 shadow-lg"><h3 className="font-serif text-xl mb-6">Order #{status.id}</h3><div className="space-y-8 relative"><div className="absolute left-[7px] top-2 bottom-2 w-[2px] bg-neutral-100"></div>{status.steps.map((step, idx) => <div key={idx} className="relative pl-8 flex items-start"><div className={`absolute left-0 w-4 h-4 rounded-full border-2 ${step.completed ? 'bg-neutral-900 border-neutral-900' : 'bg-white border-neutral-300'}`}></div><div><p className="font-medium">{step.label}</p><p className="text-xs text-neutral-400">{step.date}</p></div></div>)}</div></div>}
      </div>
    </div>
  );
};

// --- 5. ADMIN DASHBOARD ---

const AdminDashboard = () => {
  const [pin, setPin] = useState('');
  const [auth, setAuth] = useState(false);
  const [tab, setTab] = useState('products');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  
  const [currentProduct, setCurrentProduct] = useState({ 
      id: '', name: '', price: '', category: '', style: 'Modern', images: [], 
      description: '', 
      richDescription: { story: '', materials: '', care: '', dimensions: '' } 
  });
  const [rawImageInput, setRawImageInput] = useState('');
  
  const { siteContent, updateSiteContent, products, addProduct, updateProduct, deleteProduct, categories, addCategory, deleteCategory, orders, subscribers } = useContext(StoreContext);
  
  const [heroForm, setHeroForm] = useState(siteContent.hero);
  const [videoForm, setVideoForm] = useState(siteContent.featuredVideo);
  const [newCatName, setNewCatName] = useState('');

  useEffect(() => { 
      setHeroForm(siteContent.hero); 
      setVideoForm(siteContent.featuredVideo);
  }, [siteContent]);

  const openAddModal = () => { 
      setModalMode('add'); 
      setCurrentProduct({ name: '', price: '', category: 'furniture', style: 'Modern', images: [], description: '', richDescription: { story: '', materials: '', care: '', dimensions: '' } }); 
      setRawImageInput(''); 
      setShowModal(true); 
  };
  
  const openEditModal = (product) => { 
      setModalMode('edit'); 
      setCurrentProduct(product); 
      setRawImageInput((product.images || []).join('\n')); 
      setShowModal(true); 
  };

  const handleModalSave = (e) => {
    e.preventDefault();
    const manualImages = rawImageInput.split(/[\n,]+/).map(s => s.trim()).filter(s => s.length > 0);
    // Use manual images if present, otherwise use existing product images.
    // NOTE: This allows mixing new base64 uploads with existing URLs if managed carefully, 
    // but here we primarily replace the list for simplicity.
    const finalImages = manualImages.length > 0 ? manualImages : currentProduct.images;
    
    const productData = { 
        ...currentProduct, 
        price: Number(currentProduct.price), 
        rating: currentProduct.rating || 5.0, 
        images: finalImages 
    };
    if (modalMode === 'add') addProduct(productData); else updateProduct(currentProduct.id, productData);
    setShowModal(false);
  };

  // UPDATED: Convert files to Base64 so they persist in Firestore
  const handleFileSelect = async (e) => {
      const files = Array.from(e.target.files);
      if (files.length) {
          const base64Promises = files.map(file => {
              return new Promise((resolve, reject) => {
                  const reader = new FileReader();
                  reader.onload = () => resolve(reader.result);
                  reader.onerror = error => reject(error);
                  reader.readAsDataURL(file);
              });
          });

          try {
              const base64Results = await Promise.all(base64Promises);
              const existing = rawImageInput.split(/[\n,]+/).map(s=>s.trim()).filter(s=>s);
              const combined = [...existing, ...base64Results];
              setRawImageInput(combined.join('\n'));
          } catch (error) {
              console.error("Error converting images", error);
              alert("Error converting images. Try smaller files.");
          }
      }
  };

  if (!auth) return (
    <div className="h-screen flex items-center justify-center bg-neutral-900">
        <div className="bg-white p-12 rounded-none w-full max-w-md text-center shadow-2xl">
            <div className="mb-8">
                <h2 className="text-2xl font-serif mb-2">Casa Admin</h2>
                <p className="text-neutral-500 text-sm">Restricted Access</p>
            </div>
            <input type="password" placeholder="Access PIN" className="w-full p-4 border border-neutral-300 text-center tracking-[0.5em] mb-4 focus:border-neutral-900 outline-none transition-colors" value={pin} onChange={(e) => setPin(e.target.value)} />
            <Button onClick={() => pin === 'CASA2025' ? setAuth(true) : alert('Access Denied')} className="w-full">Authenticate</Button>
        </div>
    </div>
  );

  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);

  return (
    <div className="min-h-screen bg-neutral-50 pt-24 px-6 pb-20">
      <div className="max-w-[1600px] mx-auto">
        <header className="flex justify-between items-end mb-12 border-b border-neutral-200 pb-6">
            <div>
                <h1 className="text-4xl font-serif text-neutral-900 mb-2">Command Center</h1>
                <p className="text-neutral-500">Welcome back, Administrator.</p>
            </div>
            <Button variant="outline" onClick={() => { setAuth(false); window.dispatchEvent(new CustomEvent('navigate', { detail: 'home' })); }}>Exit to Store</Button>
        </header>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white p-6 shadow-sm border border-neutral-100 flex items-center justify-between">
                <div>
                    <p className="text-neutral-500 text-xs font-bold uppercase tracking-wider">Total Revenue</p>
                    <p className="text-2xl font-mono mt-2">PKR {totalRevenue.toLocaleString()}</p>
                </div>
                <div className="bg-green-50 p-3 rounded-full text-green-600"><DollarSign size={24}/></div>
            </div>
            <div className="bg-white p-6 shadow-sm border border-neutral-100 flex items-center justify-between">
                <div>
                    <p className="text-neutral-500 text-xs font-bold uppercase tracking-wider">Total Orders</p>
                    <p className="text-2xl font-mono mt-2">{orders.length}</p>
                </div>
                <div className="bg-blue-50 p-3 rounded-full text-blue-600"><ShoppingBag size={24}/></div>
            </div>
            <div className="bg-white p-6 shadow-sm border border-neutral-100 flex items-center justify-between">
                <div>
                    <p className="text-neutral-500 text-xs font-bold uppercase tracking-wider">Subscribers</p>
                    <p className="text-2xl font-mono mt-2">{subscribers.length}</p>
                </div>
                <div className="bg-purple-50 p-3 rounded-full text-purple-600"><Mail size={24}/></div>
            </div>
        </div>

        <div className="flex gap-2 mb-8 border-b border-neutral-200 overflow-x-auto">
          {['products', 'content', 'categories', 'orders', 'subscribers'].map(t => (
              <button 
                key={t}
                onClick={() => setTab(t)} 
                className={`px-8 py-4 text-sm font-bold uppercase tracking-wider transition-all whitespace-nowrap ${tab === t ? 'bg-neutral-900 text-white' : 'text-neutral-500 hover:text-neutral-900'}`}
              >
                  {t}
              </button>
          ))}
        </div>

        {tab === 'products' && (
          <div className="bg-white p-8 shadow-sm border border-neutral-100">
            <div className="flex justify-between mb-8 items-center">
                <h3 className="font-bold text-lg">Active Inventory</h3>
                <Button onClick={openAddModal} className="text-xs"><Plus size={16} /> New Item</Button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-neutral-100 text-xs font-bold uppercase text-neutral-400 tracking-wider">
                            <th className="pb-4 pl-4">Preview</th>
                            <th className="pb-4">Product Name</th>
                            <th className="pb-4">Category</th>
                            <th className="pb-4 text-right">Price</th>
                            <th className="pb-4 text-right pr-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map(p => (
                            <tr key={p.id} className="border-b border-neutral-50 last:border-0 hover:bg-neutral-50 group transition-colors">
                                <td className="py-4 pl-4"><img src={p.images[0]} className="w-12 h-12 object-cover bg-neutral-100" alt="" /></td>
                                <td className="py-4 font-medium text-neutral-900">{p.name}</td>
                                <td className="py-4 text-neutral-500 capitalize">{p.category} <span className="text-xs text-neutral-300">• {p.style}</span></td>
                                <td className="py-4 text-right font-mono text-sm">PKR {p.price.toLocaleString()}</td>
                                <td className="py-4 text-right pr-4">
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => openEditModal(p)} className="p-2 hover:bg-neutral-200 rounded text-neutral-600"><Edit2 size={16} /></button>
                                        <button onClick={() => deleteProduct(p.id)} className="p-2 hover:bg-red-50 rounded text-red-500"><Trash2 size={16} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
          </div>
        )}

        {tab === 'content' && (
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-8 shadow-sm border border-neutral-100">
              <h3 className="font-bold mb-6 flex items-center gap-2"><Monitor size={20} /> Hero Configuration</h3>
              <form onSubmit={(e) => { e.preventDefault(); updateSiteContent('hero', heroForm); alert("Hero Saved!"); }} className="space-y-6">
                <div className="space-y-4">
                  <div><label className="text-xs font-bold uppercase text-neutral-500 block mb-1">Background Image URL</label><input className="w-full p-3 border rounded" value={heroForm.image} onChange={e => setHeroForm({...heroForm, image: e.target.value})} /></div>
                  <div><label className="text-xs font-bold uppercase text-neutral-500 block mb-1">Main Title</label><textarea className="w-full p-3 border rounded font-serif text-lg" rows={2} value={heroForm.title} onChange={e => setHeroForm({...heroForm, title: e.target.value})} /></div>
                  <div><label className="text-xs font-bold uppercase text-neutral-500 block mb-1">Subtitle</label><input className="w-full p-3 border rounded" value={heroForm.subtitle} onChange={e => setHeroForm({...heroForm, subtitle: e.target.value})} /></div>
                </div>
                <Button type="submit" className="w-full">Update Hero</Button>
              </form>
            </div>

            <div className="bg-white p-8 shadow-sm border border-neutral-100">
              <h3 className="font-bold mb-6 flex items-center gap-2"><Video size={20} /> Runtime Video Section</h3>
              <form onSubmit={(e) => { e.preventDefault(); updateSiteContent('featuredVideo', videoForm); alert("Video Saved!"); }} className="space-y-6">
                <div className="space-y-4">
                  <div><label className="text-xs font-bold uppercase text-neutral-500 block mb-1">Video Source URL (MP4)</label><input className="w-full p-3 border rounded" value={videoForm.videoUrl} onChange={e => setVideoForm({...videoForm, videoUrl: e.target.value})} placeholder="https://..." /></div>
                  <div><label className="text-xs font-bold uppercase text-neutral-500 block mb-1">Section Heading</label><input className="w-full p-3 border rounded" value={videoForm.title} onChange={e => setVideoForm({...videoForm, title: e.target.value})} /></div>
                  <div><label className="text-xs font-bold uppercase text-neutral-500 block mb-1">Description Text</label><textarea className="w-full p-3 border rounded" rows={3} value={videoForm.description} onChange={e => setVideoForm({...videoForm, description: e.target.value})} /></div>
                </div>
                <Button type="submit" className="w-full">Update Video Section</Button>
              </form>
            </div>
          </div>
        )}

        {tab === 'categories' && (
            <div className="bg-white p-8 shadow-sm border border-neutral-100 max-w-2xl">
                <h3 className="font-bold mb-6">Shop Categories</h3>
                <div className="flex gap-2 mb-8">
                    <input placeholder="New Category Name" className="flex-1 p-3 border" value={newCatName} onChange={e => setNewCatName(e.target.value)} />
                    <Button onClick={() => { if(newCatName) { addCategory({name: newCatName, image: ''}); setNewCatName(''); }}}>Add</Button>
                </div>
                <div className="space-y-2">
                    {categories.filter(c => c.id !== 'all').map(c => (
                        <div key={c.id} className="flex justify-between items-center p-4 border bg-neutral-50">
                            <span className="font-medium">{c.name}</span>
                            <button onClick={() => deleteCategory(c.id)} className="text-red-500 hover:underline text-sm">Remove</button>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {tab === 'orders' && (
             <div className="bg-white p-8 shadow-sm border border-neutral-100">
                <h3 className="font-bold mb-6">Recent Customer Orders</h3>
                {orders.length === 0 ? <p className="text-neutral-400">No orders found.</p> : (
                    <div className="space-y-4">
                        {orders.map(o => (
                            <div key={o.id} className="border p-4 rounded flex justify-between items-center">
                                <div>
                                    <p className="font-bold">{o.id}</p>
                                    <p className="text-sm text-neutral-500">{o.customer.email} • {new Date(o.date).toLocaleDateString()}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-mono font-bold">PKR {o.total.toLocaleString()}</p>
                                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">{o.status}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
             </div>
        )}

        {tab === 'subscribers' && (
            <div className="bg-white p-8 shadow-sm border border-neutral-100">
               <h3 className="font-bold mb-6">Newsletter Subscribers</h3>
               {subscribers.length === 0 ? <p className="text-neutral-400">No subscribers yet.</p> : (
                   <div className="space-y-2">
                       {subscribers.map((s, idx) => (
                           <div key={idx} className="border-b p-4 flex justify-between">
                               <span className="font-medium">{s.email}</span>
                               <span className="text-sm text-neutral-500">{new Date(s.date).toLocaleDateString()}</span>
                           </div>
                       ))}
                   </div>
               )}
            </div>
       )}

        <AnimatePresence>
          {showModal && (
            <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
              <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} className="bg-white w-full max-w-4xl max-h-[90vh] relative z-10 overflow-hidden flex flex-col shadow-2xl">
                <div className="p-6 border-b flex justify-between items-center bg-neutral-50">
                    <h3 className="font-serif text-xl">{modalMode === 'add' ? 'Add New Product' : 'Edit Product'}</h3>
                    <button onClick={() => setShowModal(false)}><X size={20} /></button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-8">
                    <form id="product-form" onSubmit={handleModalSave} className="space-y-8">
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-2">
                                <label className="text-xs font-bold uppercase text-neutral-500 block mb-2">Product Name</label>
                                <input className="w-full p-3 border rounded" value={currentProduct.name} onChange={e => setCurrentProduct({...currentProduct, name: e.target.value})} required />
                            </div>
                            <div>
                                <label className="text-xs font-bold uppercase text-neutral-500 block mb-2">Price (PKR)</label>
                                <input type="number" className="w-full p-3 border rounded" value={currentProduct.price} onChange={e => setCurrentProduct({...currentProduct, price: e.target.value})} required />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="text-xs font-bold uppercase text-neutral-500 block mb-2">Category</label>
                                <select className="w-full p-3 border rounded bg-white" value={currentProduct.category} onChange={e => setCurrentProduct({...currentProduct, category: e.target.value})}>
                                    {categories.filter(c => c.id !== 'all').map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold uppercase text-neutral-500 block mb-2">Style Theme</label>
                                <select className="w-full p-3 border rounded bg-white" value={currentProduct.style || 'Modern'} onChange={e => setCurrentProduct({...currentProduct, style: e.target.value})}>
                                    {['Modern', 'Classical', 'Bohemian', 'Industrial', 'Minimalist'].map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold uppercase text-neutral-500 block mb-2">Product Images</label>
                            <p className="text-xs text-red-500 mb-2">Note: Images will be converted to text to save to database. Use small files for best performance.</p>
                            <div className="border-2 border-dashed border-neutral-300 p-6 rounded-lg text-center hover:bg-neutral-50 transition-colors">
                                <textarea 
                                    className="w-full p-3 border rounded text-xs font-mono mb-4" 
                                    rows={3} 
                                    placeholder="Paste Image URLs here (separated by new lines or commas)..."
                                    value={rawImageInput} 
                                    onChange={e => setRawImageInput(e.target.value)} 
                                />
                                <div className="relative inline-block">
                                    <Button type="button" variant="outline" className="pointer-events-none">Upload Files from PC</Button>
                                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" multiple onChange={handleFileSelect} />
                                </div>
                            </div>
                            {rawImageInput && (
                                <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                                    {rawImageInput.split(/[\n,]+/).filter(s=>s.trim()).map((url, idx) => (
                                        <img key={idx} src={url} className="w-16 h-16 object-cover rounded border" onError={(e) => e.target.style.display = 'none'} />
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="h-px bg-neutral-200 my-8"></div>

                        <div>
                            <h4 className="font-bold text-lg mb-4 flex items-center gap-2"><FileText size={18}/> Rich Blog Content</h4>
                            <div className="space-y-6">
                                <div>
                                    <label className="text-xs font-bold uppercase text-neutral-500 block mb-2">Design Story</label>
                                    <textarea className="w-full p-3 border rounded h-24" placeholder="Tell the story of this product..." value={currentProduct.richDescription?.story || ''} onChange={e => setCurrentProduct({...currentProduct, richDescription: {...currentProduct.richDescription, story: e.target.value}})} />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <label className="text-xs font-bold uppercase text-neutral-500 block mb-2">Materials</label>
                                        <input className="w-full p-3 border rounded" value={currentProduct.richDescription?.materials || ''} onChange={e => setCurrentProduct({...currentProduct, richDescription: {...currentProduct.richDescription, materials: e.target.value}})} />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold uppercase text-neutral-500 block mb-2">Care Instructions</label>
                                        <input className="w-full p-3 border rounded" value={currentProduct.richDescription?.care || ''} onChange={e => setCurrentProduct({...currentProduct, richDescription: {...currentProduct.richDescription, care: e.target.value}})} />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold uppercase text-neutral-500 block mb-2">Dimensions</label>
                                        <input className="w-full p-3 border rounded" value={currentProduct.richDescription?.dimensions || ''} onChange={e => setCurrentProduct({...currentProduct, richDescription: {...currentProduct.richDescription, dimensions: e.target.value}})} />
                                    </div>
                                </div>
                            </div>
                        </div>

                    </form>
                </div>
                
                <div className="p-6 border-t bg-neutral-50 flex justify-end gap-4">
                    <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
                    <Button onClick={() => document.getElementById('product-form').requestSubmit()}>Save Product</Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// --- MAIN CONTENT RENDERER ---

const MainContent = () => {
  const [view, setView] = useState('home');
  const [showWelcome, setShowWelcome] = useState(true);
  const [emailInput, setEmailInput] = useState('');
  const { cart, setCartOpen, products, categories, selectedCategory, setSelectedCategory, searchQuery, siteContent, selectedStyle, setSelectedStyle, isLoading, addSubscriber } = useContext(StoreContext);

  useEffect(() => {
    const handler = (e) => {
      setView(e.detail);
      if(e.detail === 'shop') { setSelectedCategory('all'); setSelectedStyle('all'); }
    };
    window.addEventListener('navigate', handler);
    return () => window.removeEventListener('navigate', handler);
  }, []);

  const handleSubscribe = () => {
      if(emailInput && emailInput.includes('@')) {
          addSubscriber(emailInput);
          setEmailInput('');
      } else {
          alert("Please enter a valid email address.");
      }
  };

  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesStyle = selectedStyle === 'all' || p.style === selectedStyle;
    const matchesSearch = (p.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || (p.category || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch && matchesStyle;
  });

  const renderView = () => {
    if (isLoading) return <div className="h-screen flex items-center justify-center"><Loader className="animate-spin" size={40} /></div>;

    switch(view) {
      case 'home':
        return (
          <>
            <Hero navigate={(v) => { setView(v); if(v === 'shop') setSelectedCategory('all'); }} />
            
            {siteContent.featuredVideo.videoUrl && (
                <section className="relative h-[60vh] bg-black overflow-hidden flex items-center justify-center">
                    <video autoPlay loop muted playsInline className="absolute w-full h-full object-cover opacity-70">
                        <source src={siteContent.featuredVideo.videoUrl} type="video/mp4" />
                    </video>
                    <div className="relative z-10 text-center text-white max-w-2xl px-4">
                        <h2 className="text-4xl font-serif mb-4">{siteContent.featuredVideo.title}</h2>
                        <p className="text-lg opacity-90 mb-8">{siteContent.featuredVideo.description}</p>
                        <Button variant="outline" className="border-white text-white hover:bg-white hover:text-black" onClick={() => setView('shop')}>Shop The Look</Button>
                    </div>
                </section>
            )}

            <Section title="Shop by Aesthetic">
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                 {['Modern', 'Bohemian', 'Classical', 'Industrial'].map((style, i) => (
                   <div key={style} className="relative h-64 group overflow-hidden cursor-pointer bg-neutral-200" onClick={() => { setView('shop'); setSelectedCategory('all'); setSelectedStyle(style); }}>
                     <img src={`https://source.unsplash.com/random/600x800?interior,${style}`} onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&q=80&w=400'} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={style} />
                     <div className="absolute inset-0 bg-black/30 flex items-center justify-center"><h3 className="text-white font-serif text-2xl tracking-wide">{style}</h3></div>
                   </div>
                 ))}
               </div>
            </Section>
            
            <Section title="Featured Collection" className="bg-neutral-50">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">{products.slice(0, 3).map(p => <ProductCard key={p.id} product={p} />)}</div>
              <div className="mt-12 text-center"><Button variant="outline" onClick={() => { setView('shop'); setSelectedCategory('all'); }}>View All Products</Button></div>
            </Section>

            <section className="py-20 bg-neutral-50 px-6">
              <div className="max-w-4xl mx-auto text-center">
                <h2 className="text-3xl font-serif mb-4">Join the Inner Circle</h2>
                <p className="text-neutral-600 mb-8">Subscribe to receive early access to new collections and exclusive interior design tips.</p>
                <div className="flex max-w-md mx-auto gap-2">
                    <input 
                        value={emailInput} 
                        onChange={(e) => setEmailInput(e.target.value)} 
                        placeholder="Email Address" 
                        className="flex-1 p-3 border border-neutral-300 outline-none focus:border-neutral-900" 
                    />
                    <Button onClick={handleSubscribe}>Subscribe</Button>
                </div>
              </div>
            </section>
          </>
        );
      case 'shop':
        return (
          <div className="pt-24 px-6 md:px-12 max-w-7xl mx-auto min-h-screen">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                <div>
                    <h1 className="text-4xl font-serif mb-2">The Collection</h1>
                    <p className="text-neutral-500">{selectedStyle === 'all' ? 'All Styles' : selectedStyle} &bull; {selectedCategory === 'all' ? 'All Items' : categories.find(c => c.id === selectedCategory)?.name}</p>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {['all', 'Modern', 'Classical', 'Bohemian', 'Industrial'].map(style => (
                        <button key={style} onClick={() => setSelectedStyle(style)} className={`px-4 py-2 rounded-full text-xs uppercase tracking-widest ${selectedStyle === style ? 'bg-black text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}>
                            {style === 'all' ? 'All Styles' : style}
                        </button>
                    ))}
                </div>
            </div>
            
            {searchQuery && <p className="text-center mb-8 text-neutral-500">Search results for "{searchQuery}"</p>}

            <div className="flex overflow-x-auto gap-4 mb-12 pb-4 scrollbar-hide justify-start md:justify-center">
              {categories.map(cat => (
                <button key={cat.id} onClick={() => setSelectedCategory(cat.id)} className={`whitespace-nowrap px-6 py-2 border transition-colors uppercase text-sm tracking-wider flex items-center gap-2 ${selectedCategory === cat.id ? 'bg-neutral-900 text-white border-neutral-900' : 'border-neutral-200 hover:border-neutral-900 text-neutral-600'}`}>{cat.name}</button>
              ))}
            </div>

            <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
              <AnimatePresence mode="popLayout">
                {filteredProducts.map(p => (<motion.div key={p.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.3 }}><ProductCard product={p} /></motion.div>))}
              </AnimatePresence>
            </div>
            {filteredProducts.length === 0 && <div className="text-center text-neutral-400 py-20">No products found matching your criteria.</div>}
          </div>
        );
      case 'profile': return <UserProfile navigate={setView} />;
      case 'visualizer': return <RoomVisualizer />;
      case 'track': return <OrderTracking />;
      case 'checkout': return <Checkout navigate={setView} />;
      case 'admin': return <AdminDashboard />;
      default: return <div className="pt-32 text-center">Page Not Found</div>;
    }
  };

  if (view === 'admin') return <AdminDashboard />;

  return (
    <div className="font-sans text-neutral-800 bg-white min-h-screen overflow-hidden">
      <AnimatePresence>{showWelcome && <WelcomeScreen onComplete={() => setShowWelcome(false)} />}</AnimatePresence>
      <Navbar onNavigate={(v) => { setView(v); if(v === 'shop') setSelectedCategory('all'); }} cartCount={cart.length} openCart={() => setCartOpen(true)} />
      <CartDrawer />
      <ProductDetailModal />
      <AuthModal />
      <NotificationToast />
      <main>{renderView()}</main>
      <footer className="bg-neutral-950 text-neutral-500 py-16 px-6 border-t border-neutral-900"><div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12"><div><h4 className="text-white font-serif text-xl mb-6">CASA ELEGANCE</h4><p className="text-sm leading-relaxed">Redefining luxury through minimalist design.</p></div><div><h5 className="text-white uppercase tracking-widest text-xs font-bold mb-6">Support</h5><ul className="space-y-3 text-sm"><li onClick={() => setView('track')} className="cursor-pointer hover:text-white">Track Order</li><li onClick={() => setView('admin')} className="cursor-pointer hover:text-white">Admin Login</li></ul></div><div><h5 className="text-white uppercase tracking-widest text-xs font-bold mb-6">Stay Connected</h5><div className="flex gap-4"><Instagram className="hover:text-amber-500 cursor-pointer" /><Facebook className="hover:text-amber-500 cursor-pointer" /><Twitter className="hover:text-amber-500 cursor-pointer" /></div></div></div><div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-neutral-900 text-center text-xs tracking-widest">© 2025 CASA ELEGANCE. ALL RIGHTS RESERVED.</div></footer>
    </div>
  );
};

const App = () => {
  return (
    <StoreProvider>
      <MainContent />
    </StoreProvider>
  );
};

export default App;