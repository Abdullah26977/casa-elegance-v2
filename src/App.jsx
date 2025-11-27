import React, { useState, useEffect, useContext, createContext, useMemo, useRef } from 'react';
import { 
  ShoppingBag, Search, Menu, X, Star, ArrowRight, Upload, 
  Check, Truck, Package, User, Heart, Play, ChevronRight, 
  Instagram, Facebook, Twitter, ShieldCheck, MapPin, Loader,
  Edit2, Trash2, Plus, Save, Image as ImageIcon, LayoutGrid, Monitor, ChevronLeft,
  LogOut, Mail, Bell, Home, Video, Settings, FileText, Layers, RefreshCw,
  Phone, Calendar, DollarSign, BarChart3, Users, ExternalLink, Info, Send, Tag, Percent, Palette,
  Ruler, Box, MousePointer2, Move, RotateCw, ZoomIn, Grid, Maximize, ArrowUp, ArrowDown, ArrowLeft,
  Sun, Moon, Copy, HelpCircle, Eye, Trash, CheckCircle2, Sliders, Paintbrush, Square, CircleDot
} from 'lucide-react';

import { motion, AnimatePresence } from 'framer-motion';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, collection, getDocs, doc, setDoc, addDoc, query, where, updateDoc, deleteDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// ==========================================
// 0. UTILITIES
// ==========================================

const compressImage = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const MAX_SIZE = 800;
        if (width > height) {
          if (width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; }
        } else {
          if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.6));
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
};

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

let db, auth, storage;
try {
   const app = initializeApp(firebaseConfig);
   db = getFirestore(app);
   auth = getAuth(app);
   storage = getStorage(app);
} catch (e) {
  console.log("Firebase not configured properly.");
}

const INITIAL_CATEGORIES = [
  { id: 'all', name: 'View All', image: '' },
  { id: 'furniture', name: 'Furniture', image: 'https://images.unsplash.com/photo-1531835551805-16d864c8d311?auto=format&fit=crop&q=80&w=800' },
  { id: 'illumination', name: 'Illumination', image: 'https://images.unsplash.com/photo-1513506003013-453c47d7e601?auto=format&fit=crop&q=80&w=800' },
  { id: 'textiles', name: 'Textiles', image: 'https://images.unsplash.com/photo-1528458909336-e7a0adfed0a5?auto=format&fit=crop&q=80&w=800' },
  { id: 'decor', name: 'Decor', image: 'https://images.unsplash.com/photo-1581539250439-c96689b516dd?auto=format&fit=crop&q=80&w=800' },
  { id: 'smart-blinds', name: 'Smart Blinds', image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=800' }
];

const INITIAL_STYLES = [
    { id: 'Modern', name: 'Modern', image: 'https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&q=80&w=600' },
    { id: 'Bohemian', name: 'Bohemian', image: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&q=80&w=600' },
    { id: 'Classical', name: 'Classical', image: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&q=80&w=600' },
    { id: 'Industrial', name: 'Industrial', image: 'https://images.unsplash.com/photo-1534349762230-e73c239d5379?auto=format&fit=crop&q=80&w=600' }
];

const MOCK_PRODUCTS = [
  { 
    id: '1', 
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
  }
];

const INITIAL_SITE_CONTENT = {
  hero: {
    subtitle: "Est. 2025 • Casa Elegance",
    title: "Curated Living \n for the Modern Soul",
    buttonText: "Explore Collection",
    image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=2000",
  },
  featuredVideo: {
    title: "Experience the Mood",
    subtitle: "Cinematic Living",
    description: "Immerse yourself in spaces designed for serenity and sophistication.",
    videoUrl: "https://joy1.videvo.net/videvo_files/video/free/2019-09/large_watermarked/190828_27_Supermarket_music_08_preview.mp4", 
    ctaText: "Shop The Look"
  },
  promotions: [
    { id: 'promo1', title: 'Summer Solstice', subtitle: 'Up to 30% Off', image: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?auto=format&fit=crop&q=80&w=400' },
    { id: 'promo2', title: 'New Arrivals', subtitle: 'Explore the Fresh Collection', image: 'https://images.unsplash.com/photo-1567016432779-094069958ea5?auto=format&fit=crop&q=80&w=400' }
  ],
  contact: {
    address: "Phase 6, DHA, Lahore, Pakistan",
    phone: "+92 300 1234567",
    email: "concierge@casaelegance.pk"
  }
};

// --- NEW: Default Assets for Studio ---
const DEFAULT_DESIGNER_ASSETS = {
  paints: [
    { id: 'p-swiss', name: 'Swiss Coffee', value: '#fdfbf7', price: 150 },
    { id: 'p-chantilly', name: 'Chantilly Lace', value: '#f5f5f5', price: 155 },
    { id: 'p-dove', name: 'Dove Wing', value: '#e0e0e0', price: 160 },
    { id: 'p-revere', name: 'Revere Pewter', value: '#cbc7be', price: 165 },
    { id: 'p-classic', name: 'Classic Gray', value: '#dcdcdc', price: 155 },
    { id: 'p-charcoal', name: 'Wrought Iron', value: '#2c3e50', price: 180 },
    { id: 'p-black', name: 'Onyx', value: '#121212', price: 190 },
    { id: 'p-navy', name: 'Hale Navy', value: '#1a237e', price: 185 },
    { id: 'p-forest', name: 'Forest Green', value: '#1a2e1f', price: 180 }
  ],
  wallpapers: [
    { id: 'w-damask', name: 'Royal Damask', url: 'https://images.unsplash.com/photo-1615800098779-1be8287d0bdd?auto=format&fit=crop&q=80&w=400', price: 450 },
    { id: 'w-artdeco', name: 'Art Deco Gold', url: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&q=80&w=400', price: 650 },
    { id: 'w-geo-gold', name: 'Gold Geometric', url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=400', price: 500 },
    { id: 'w-concrete', name: 'Industrial Concrete', url: 'https://images.unsplash.com/photo-1517646331032-9e8563c520a1?auto=format&fit=crop&q=80&w=400', price: 600 }
  ],
  floors: [
    { id: 'f-oak', name: 'French Oak', url: 'https://images.unsplash.com/photo-1516455590571-18256e5bb9ff?auto=format&fit=crop&q=80&w=400', price: 850 },
    { id: 'f-walnut', name: 'Dark Walnut', url: 'https://images.unsplash.com/photo-1550226891-ef816aed4a98?auto=format&fit=crop&q=80&w=400', price: 1000 },
    { id: 'f-marble-w', name: 'Carrara Marble', url: 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?auto=format&fit=crop&q=80&w=400', price: 1200 },
    { id: 'f-concrete', name: 'Polished Concrete', url: 'https://images.unsplash.com/photo-1517646331032-9e8563c520a1?auto=format&fit=crop&q=80&w=400', price: 900 }
  ],
  ceilings: [
    { id: 'c-white', name: 'Matte White', value: '#ffffff', price: 100 },
    { id: 'c-offwhite', name: 'Cream', value: '#fdfbf7', price: 120 },
    { id: 'c-tin', name: 'Vintage Tin', url: 'https://images.unsplash.com/photo-1533038590840-1cde6e668a91?auto=format&fit=crop&q=80&w=400', price: 300 },
    { id: 'c-wood', name: 'Wood Planks', url: 'https://images.unsplash.com/photo-1534349762230-e73c239d5379?auto=format&fit=crop&q=80&w=400', price: 400 }
  ]
};

// ==========================================
// 2. STORE CONTEXT
// ==========================================

const StoreContext = createContext();

const StoreProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false); 
  const [wishlist, setWishlist] = useState([]);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState(MOCK_PRODUCTS);
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [styles, setStyles] = useState(INITIAL_STYLES); 
  const [siteContent, setSiteContent] = useState(INITIAL_SITE_CONTENT);
  const [designerAssets, setDesignerAssets] = useState(DEFAULT_DESIGNER_ASSETS); // NEW: Assets State
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

  useEffect(() => {
    if (!db) return; 

    const fetchData = async () => {
      try {
        const productsSnapshot = await getDocs(collection(db, "products"));
        const dbProducts = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if (dbProducts.length > 0) setProducts(dbProducts);

        const catSnapshot = await getDocs(collection(db, "categories"));
        const dbCategories = catSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if (dbCategories.length > 0) setCategories(dbCategories);

        const styleSnapshot = await getDocs(collection(db, "styles"));
        const dbStyles = styleSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if (dbStyles.length > 0) setStyles(dbStyles);

        const orderSnapshot = await getDocs(collection(db, "orders"));
        const dbOrders = orderSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setOrders(dbOrders);
        
        const subSnapshot = await getDocs(collection(db, "subscribers"));
        const dbSubs = subSnapshot.docs.map(doc => doc.data());
        setSubscribers(dbSubs);

        const contentSnapshot = await getDocs(collection(db, "content"));
        const dbContent = {};
        contentSnapshot.docs.forEach(doc => { dbContent[doc.id] = doc.data() });
        if (Object.keys(dbContent).length > 0) {
            setSiteContent(prev => ({ ...prev, ...dbContent }));
        }

        // NEW: Fetch Assets
        const assetsSnapshot = await getDocs(collection(db, "assets"));
        if (!assetsSnapshot.empty) {
            const dbAssets = { ...DEFAULT_DESIGNER_ASSETS };
            assetsSnapshot.docs.forEach(doc => {
                if (doc.exists()) dbAssets[doc.id] = doc.data().items || [];
            });
            setDesignerAssets(dbAssets);
        }

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

  const uploadFile = async (file, path) => {
      try {
          const base64 = await compressImage(file);
          return base64;
      } catch (error) {
          console.error("Upload failed", error);
          showNotification("Image processing failed.", "error");
          return null;
      }
  };

  const uploadVideoFile = async (file) => {
    if (!storage) {
        showNotification("Storage not configured for Video", "error");
        return null;
    }
    try {
        const videoRef = ref(storage, `videos/${Date.now()}_${file.name}`);
        const snapshot = await uploadBytes(videoRef, file);
        const url = await getDownloadURL(snapshot.ref);
        return url;
    } catch (error) {
        console.error("Video upload failed", error);
        showNotification("Video upload failed", "error");
        return null;
    }
  };

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
      if (db) await setDoc(doc(db, "products", newProduct.id), newProduct);
      setIsLoading(false);
      showNotification("Product created successfully");
  };
  
  const updateProduct = async (id, updatedData) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updatedData } : p));
    if (db) {
        const productRef = doc(db, "products", id.toString());
        await updateDoc(productRef, updatedData);
    }
    showNotification("Product updated");
  };
  
  const deleteProduct = async (id) => {
      if(window.confirm("Are you sure?")) {
        setProducts(prev => prev.filter(p => p.id !== id));
        if (db) await deleteDoc(doc(db, "products", id.toString()));
        showNotification("Product deleted", "info");
      }
  };
  
  const addCategory = async (category) => {
    const id = category.id || category.name.toLowerCase().replace(/\s+/g, '-');
    const newCat = { ...category, id };
    
    setCategories(prev => {
        const exists = prev.find(c => c.id === id);
        if (exists) return prev.map(c => c.id === id ? newCat : c);
        return [...prev, newCat];
    });

    if (db) await setDoc(doc(db, "categories", id), newCat);
    showNotification("Category saved successfully");
  };
  
  const deleteCategory = async (id) => {
      if(window.confirm("Delete this category?")) {
        setCategories(prev => prev.filter(c => c.id !== id));
        if (db) await deleteDoc(doc(db, "categories", id));
        showNotification("Category removed", "info");
      }
  };

  const addStyle = async (style) => {
      const id = style.id || style.name.replace(/\s+/g, '-').toLowerCase();
      const newStyle = { ...style, id };
      setStyles(prev => {
          const exists = prev.find(s => s.id === id);
          if (exists) return prev.map(s => s.id === id ? newStyle : s);
          return [...prev, newStyle];
      });
      if (db) await setDoc(doc(db, "styles", id), newStyle);
      showNotification("Style saved successfully");
  };

  const deleteStyle = async (id) => {
      if(window.confirm("Delete this style?")) {
        setStyles(prev => prev.filter(s => s.id !== id));
        if(db) await deleteDoc(doc(db, "styles", id));
        showNotification("Style removed");
      }
  }
  
  const updateSiteContent = async (section, newData) => {
    setSiteContent(prev => ({ ...prev, [section]: newData }));
    if (db) await setDoc(doc(db, "content", section), newData);
    showNotification("Content updated successfully");
  };

  // --- NEW: ASSET MANAGEMENT FUNCTIONS ---
  const addStudioAsset = async (type, asset) => {
      const newAsset = { ...asset, id: Date.now().toString() };
      const updatedList = [...designerAssets[type], newAsset];
      setDesignerAssets(prev => ({ ...prev, [type]: updatedList }));
      if (db) await setDoc(doc(db, "assets", type), { items: updatedList });
      showNotification("Asset added to Studio");
  };

  const deleteStudioAsset = async (type, id) => {
      if(window.confirm("Remove this asset?")) {
          const updatedList = designerAssets[type].filter(i => i.id !== id);
          setDesignerAssets(prev => ({ ...prev, [type]: updatedList }));
          if (db) await setDoc(doc(db, "assets", type), { items: updatedList });
          showNotification("Asset removed");
      }
  };
  // ---------------------------------------

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
      menuOpen, setMenuOpen,
      wishlist, toggleWishlist,
      products, addProduct, updateProduct, deleteProduct,
      categories, addCategory, deleteCategory,
      styles, addStyle, deleteStyle,
      selectedCategory, setSelectedCategory,
      selectedStyle, setSelectedStyle,
      selectedProduct, setSelectedProduct,
      siteContent, updateSiteContent,
      designerAssets, addStudioAsset, deleteStudioAsset, // Exporting new features
      orders, addOrder,
      user, setUser, login, logout, authModalOpen, setAuthModalOpen,
      searchQuery, setSearchQuery, isSearchOpen, setIsSearchOpen,
      notification, showNotification,
      isLoading, uploadFile, uploadVideoFile,
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
// 4. SUB-COMPONENTS
// ==========================================

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

const NavigationDrawer = ({ onNavigate }) => {
  const { menuOpen, setMenuOpen, siteContent, setAuthModalOpen, user } = useContext(StoreContext);
  const promotions = siteContent.promotions || [];

  const handleNav = (dest) => {
      setMenuOpen(false);
      onNavigate(dest);
  };

  return (
    <AnimatePresence>
      {menuOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMenuOpen(false)} className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm" />
          <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'tween', duration: 0.3 }} className="fixed left-0 top-0 h-full w-full md:w-[400px] bg-white z-[51] shadow-2xl flex flex-col overflow-y-auto">
            <div className="p-6 border-b border-neutral-100 flex justify-between items-center">
                <span className="font-serif text-xl tracking-tight font-bold">MENU</span>
                <button onClick={() => setMenuOpen(false)}><X size={24} /></button>
            </div>
            <div className="p-6 space-y-6 flex-1">
                <div className="space-y-2">
                    {[
                        { label: 'Home', action: 'home', icon: Home },
                        { label: 'Shop Collection', action: 'shop', icon: ShoppingBag },
                        { label: 'Designer Studio', action: 'designer', icon: Box },
                        { label: 'AI Visualizer', action: 'visualizer', icon: Monitor },
                        { label: 'Track Order', action: 'track', icon: Truck },
                    ].map(item => (
                        <button key={item.label} onClick={() => handleNav(item.action)} className="flex items-center gap-4 w-full p-4 hover:bg-neutral-50 rounded-lg transition-colors text-left group">
                            <item.icon size={20} className="text-neutral-400 group-hover:text-amber-600 transition-colors" />
                            <span className="font-medium text-lg font-serif">{item.label}</span>
                        </button>
                    ))}
                    {!user ? (
                        <button onClick={() => { setMenuOpen(false); setAuthModalOpen(true); }} className="flex items-center gap-4 w-full p-4 hover:bg-neutral-50 rounded-lg transition-colors text-left group">
                            <User size={20} className="text-neutral-400 group-hover:text-amber-600 transition-colors" />
                            <span className="font-medium text-lg font-serif">Sign In</span>
                        </button>
                    ) : (
                        <button onClick={() => { setMenuOpen(false); handleNav('profile'); }} className="flex items-center gap-4 w-full p-4 hover:bg-neutral-50 rounded-lg transition-colors text-left group">
                            <User size={20} className="text-neutral-400 group-hover:text-amber-600 transition-colors" />
                            <span className="font-medium text-lg font-serif">My Profile</span>
                        </button>
                    )}
                </div>
                <div className="border-t border-neutral-100 pt-8">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-6 flex items-center gap-2"><Tag size={14}/> Featured & Offers</h4>
                    <div className="space-y-4">
                        {promotions.map((promo, idx) => (
                            <div key={idx} className="relative aspect-[2/1] bg-neutral-100 rounded-lg overflow-hidden group cursor-pointer" onClick={() => handleNav('shop')}>
                                <img src={promo.image} alt={promo.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent flex flex-col justify-center p-6 text-white">
                                    <h5 className="font-serif text-xl mb-1">{promo.title}</h5>
                                    <p className="text-sm opacity-90 text-amber-300 font-medium">{promo.subtitle}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="p-6 bg-neutral-50 border-t border-neutral-100">
                <div className="flex justify-center gap-6 text-neutral-400">
                    <Instagram size={20} className="hover:text-neutral-900 cursor-pointer" />
                    <Facebook size={20} className="hover:text-neutral-900 cursor-pointer" />
                    <Twitter size={20} className="hover:text-neutral-900 cursor-pointer" />
                </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const Navbar = ({ onNavigate, cartCount, openCart, currentView }) => {
  const [scrolled, setScrolled] = useState(false);
  const { isSearchOpen, setIsSearchOpen, user, setAuthModalOpen, setMenuOpen } = useContext(StoreContext);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md text-neutral-900 shadow-sm py-4' : 'bg-transparent text-white py-6'}`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center relative">
        <div className="flex items-center gap-6">
          {currentView !== 'home' ? (
              <button onClick={() => onNavigate('home')} className="hover:text-amber-500 transition-colors flex items-center gap-2">
                  <ChevronLeft size={24} />
                  <span className="hidden md:inline font-bold text-xs uppercase tracking-widest">Back</span>
              </button>
          ) : (
              <button onClick={() => setMenuOpen(true)} className="hover:text-amber-500 transition-colors">
                  <Menu size={24} />
              </button>
          )}
          <button onClick={() => onNavigate('home')} className="font-serif text-2xl tracking-tight font-bold hidden md:block">CASA ELEGANCE</button>
        </div>
        <button onClick={() => onNavigate('home')} className="font-serif text-xl tracking-tight font-bold md:hidden">CASA</button>
        <div className="hidden md:flex gap-6 text-sm font-medium tracking-wide uppercase absolute left-1/2 -translate-x-1/2">
            <button onClick={() => onNavigate('shop')} className="hover:text-amber-500 transition-colors">Shop</button>
            <button onClick={() => onNavigate('designer')} className="hover:text-amber-500 transition-colors">Designer</button>
            <button onClick={() => onNavigate('visualizer')} className="hover:text-amber-500 transition-colors">Visualizer</button>
            <button onClick={() => onNavigate('track')} className="hover:text-amber-500 transition-colors">Track Order</button>
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

const WelcomeScreen = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => { onComplete(); }, 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div className="fixed inset-0 z-[100] bg-neutral-950 flex items-center justify-center" exit={{ y: '-100%', transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] } }}>
      <div className="text-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, delay: 0.2 }}>
          <h1 className="text-4xl md:text-6xl font-serif text-white tracking-tighter mb-4">CASA ELEGANCE</h1>
        </motion.div>
        <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 1.5, delay: 1 }} className="h-[1px] bg-amber-500 mx-auto max-w-[200px]" />
        <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.5 }} className="text-neutral-500 text-xs uppercase tracking-[0.4em] mt-4">Luxury Defined</motion.p>
      </div>
    </motion.div>
  );
};

const ProductCard = ({ product }) => {
  const { addToCart, setSelectedProduct, toggleWishlist, wishlist } = useContext(StoreContext);
  const isWishlisted = wishlist.some(item => item.id === product.id);
  const displayImage = product.images && product.images.length > 0 ? product.images[0] : '';

  return (
    <motion.div layout initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="group relative cursor-pointer bg-white" onClick={() => setSelectedProduct(product)}>
      <div className="relative overflow-hidden aspect-[4/5] mb-6 bg-neutral-100">
        <img src={displayImage} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
        <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
            <button onClick={(e) => { e.stopPropagation(); toggleWishlist(product); }} className="p-3 rounded-full bg-white text-neutral-900 hover:bg-neutral-900 hover:text-white transition-colors shadow-md">
              <Heart size={18} className={isWishlisted ? "fill-red-500 text-red-500" : ""} />
            </button>
            <button onClick={(e) => { e.stopPropagation(); addToCart(product); }} className="p-3 rounded-full bg-white text-neutral-900 hover:bg-neutral-900 hover:text-white transition-colors shadow-md">
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

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-md flex items-center justify-center p-0 md:p-8" onClick={() => setSelectedProduct(null)}>
        <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }} className={`w-full h-full md:h-[90vh] max-w-[1400px] flex flex-col md:flex-row overflow-hidden shadow-2xl ${themeBg}`} onClick={(e) => e.stopPropagation()}>
          <div className="w-full md:w-[50%] relative h-[40vh] md:h-full bg-black">
            <img src={images[currentImageIdx]} alt={selectedProduct.name} className="w-full h-full object-cover opacity-95" />
            {images.length > 1 && (<div className="absolute bottom-8 left-8 right-8 flex justify-center gap-3">{images.map((_, idx) => (<button key={idx} onClick={() => setCurrentImageIdx(idx)} className={`h-1 transition-all duration-300 ${idx === currentImageIdx ? 'w-8 bg-white' : 'w-4 bg-white/40 hover:bg-white/70'}`} />))}</div>)}
          </div>
          <div className={`w-full md:w-[50%] flex flex-col h-full overflow-y-auto custom-scrollbar`}>
            <div className="p-8 md:p-12 lg:p-16 flex-1">
                <div className="flex justify-between items-start mb-8">
                    <div><p className="text-xs font-bold tracking-[0.2em] uppercase mb-2">{selectedProduct.style} Collection</p><h2 className="text-4xl md:text-5xl font-serif leading-tight">{selectedProduct.name}</h2></div>
                    <button onClick={() => setSelectedProduct(null)} className="hidden md:block opacity-50 hover:opacity-100 transition-opacity"><X size={32} /></button>
                </div>
                <div className="flex items-center gap-6 mb-12 pb-8 border-b border-white/20"><span className="text-3xl font-light">PKR {selectedProduct.price.toLocaleString()}</span></div>
                <div className="space-y-12 mb-16">
                    <div><h4 className="font-serif text-xl mb-4 opacity-90 italic">The Design Story</h4><p className={`leading-relaxed text-lg font-light opacity-80`}>{richDesc.story}</p></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                        <div><h5 className="font-bold uppercase text-xs tracking-widest mb-3 opacity-60">Materials</h5><p className="text-sm opacity-80 leading-relaxed">{richDesc.materials}</p></div>
                        <div><h5 className="font-bold uppercase text-xs tracking-widest mb-3 opacity-60">Care</h5><p className="text-sm opacity-80 leading-relaxed">{richDesc.care}</p></div>
                    </div>
                </div>
            </div>
            <div className="p-8 border-t border-white/20 sticky bottom-0 bg-inherit">
                <div className="flex gap-4">
                    <Button onClick={() => { addToCart(selectedProduct); setSelectedProduct(null); }} className="flex-1 py-5 text-sm bg-white text-black hover:bg-neutral-200">Add to Sanctuary</Button>
                    <button onClick={() => toggleWishlist(selectedProduct)} className="px-6 border border-white/20 hover:border-current transition-colors"><Heart size={24} fill={isWishlisted ? "currentColor" : "none"} className={isWishlisted ? "text-red-500" : ""} /></button>
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
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white w-full max-w-md relative z-10 p-8 rounded-xl shadow-2xl">
        <button onClick={() => setAuthModalOpen(false)} className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-900"><X size={20} /></button>
        <h2 className="text-3xl font-serif text-center mb-2">{isRegister ? 'Join Casa' : 'Welcome Back'}</h2>
        <div className="space-y-4 mt-8">
          {isRegister && <input placeholder="Full Name" className="w-full p-3 border rounded" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />}
          <input type="email" placeholder="Email Address" className="w-full p-3 border rounded" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          <input type="password" placeholder="Password" className="w-full p-3 border rounded" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
          <Button onClick={() => login(formData.email, isRegister ? formData.name : 'Valued Customer')} className="w-full" disabled={isLoading}>{isLoading ? 'Authenticating...' : (isRegister ? 'Create Account' : 'Sign In')}</Button>
        </div>
        <div className="mt-6 text-center text-sm"><button onClick={() => setIsRegister(!isRegister)} className="font-medium underline hover:text-amber-600">{isRegister ? 'Sign In' : 'Create Account'}</button></div>
      </motion.div>
    </div>
  );
};

const Hero = ({ navigate }) => {
  const { siteContent } = useContext(StoreContext);
  const { hero } = siteContent;
  return (
    <div className="relative h-screen w-full overflow-hidden">
      <div className="absolute inset-0 bg-neutral-900"><img src={hero.image} alt="Luxury Interior" className="w-full h-full object-cover opacity-60" /><div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-transparent to-transparent" /></div>
      <div className="absolute inset-0 flex items-center justify-center text-center px-4"><div className="max-w-4xl space-y-6"><motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="text-amber-400 tracking-[0.2em] uppercase text-sm font-medium">{hero.subtitle}</motion.p><motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 0.8 }} className="text-5xl md:text-7xl lg:text-8xl font-serif text-white leading-tight whitespace-pre-line">{hero.title}</motion.h1><motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}><Button variant="outline" className="border-white text-white hover:bg-white hover:text-neutral-900 mt-8" onClick={() => navigate('shop')}>{hero.buttonText}</Button></motion.div></div></div>
    </div>
  );
};

// ==========================================
// FIXED COMPONENT: ROOM VISUALIZER
// ==========================================

const RoomVisualizer = () => {
  const [analyzing, setAnalyzing] = useState(false);
  const [image, setImage] = useState(null);
  const [results, setResults] = useState(null);
  const [dimensions, setDimensions] = useState(null);
  const [roomItems, setRoomItems] = useState([]); // State for added items
  const [selectedItemId, setSelectedItemId] = useState(null); // State for resizing
  const { products } = useContext(StoreContext);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file)); 
      setResults(null);
      setDimensions(null);
      setRoomItems([]);
    }
  };

  const startAnalysis = () => {
    if (!image) return;
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      const randomProducts = products.sort(() => 0.5 - Math.random()).slice(0, 3);
      setResults(randomProducts);
      setDimensions({ width: Math.floor(Math.random() * 5 + 10) + ' ft', length: Math.floor(Math.random() * 5 + 12) + ' ft' });
    }, 3000);
  };

  // FIXED: Function to Add Item to Room
  const addToRoom = (product) => {
      const newItem = {
          id: Date.now(),
          product,
          x: 50, // Center X (%)
          y: 50, // Center Y (%)
          scale: 1,
          rotation: 0
      };
      setRoomItems(prev => [...prev, newItem]);
      setSelectedItemId(newItem.id);
  };

  // Function to update item properties
  const updateRoomItem = (id, prop, value) => {
      setRoomItems(prev => prev.map(item => item.id === id ? { ...item, [prop]: value } : item));
  };

  return (
    <div className="min-h-screen bg-neutral-50 pt-24 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16"><h2 className="text-4xl font-serif text-neutral-900 mb-4">AI Room Visualizer</h2><p className="text-neutral-600 max-w-2xl mx-auto">Upload a photo of your space. Our intelligence engine analyzes lighting, dimensions, and palette to suggest the perfect additions.</p></div>

        <div className="grid md:grid-cols-2 gap-12 items-start">
          <div className="bg-white p-8 rounded-xl shadow-sm border border-neutral-100 min-h-[400px] flex flex-col items-center justify-center relative overflow-hidden group">
            {image ? (
              <>
                <div className="relative w-full h-full">
                    <img src={image} alt="Room" className="w-full h-full object-cover" />
                    {/* RENDER ADDED ITEMS */}
                    {roomItems.map(item => (
                        <div 
                            key={item.id}
                            className={`absolute cursor-move ${selectedItemId === item.id ? 'ring-2 ring-amber-500 ring-offset-2' : ''}`}
                            style={{
                                left: `${item.x}%`,
                                top: `${item.y}%`,
                                transform: `translate(-50%, -50%) scale(${item.scale}) rotate(${item.rotation}deg)`,
                                width: '150px'
                            }}
                            onClick={() => setSelectedItemId(item.id)}
                        >
                            <img src={item.product.images[0]} className="w-full h-full object-contain drop-shadow-2xl" />
                            {selectedItemId === item.id && <button onClick={(e) => { e.stopPropagation(); setRoomItems(roomItems.filter(i => i.id !== item.id)); }} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"><X size={12}/></button>}
                        </div>
                    ))}
                </div>

                {analyzing && (<div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center text-white"><Loader className="animate-spin mb-4" size={40} /><p className="tracking-widest uppercase text-sm">Scanning Geometry...</p></div>)}
                {!analyzing && !results && (<button onClick={startAnalysis} className="absolute bottom-8 bg-white text-neutral-900 px-8 py-3 rounded-full shadow-lg font-medium hover:scale-105 transition-transform">Analyze Space</button>)}
              </>
            ) : (
              <label className="cursor-pointer flex flex-col items-center text-neutral-400 hover:text-neutral-900 transition-colors"><Upload size={48} className="mb-4" /><span className="text-lg font-medium">Click to Upload Room Photo</span><span className="text-sm mt-2">JPG or PNG (Max 5MB)</span><input type="file" className="hidden" onChange={handleUpload} accept="image/*" /></label>
            )}
          </div>

          <div className="space-y-6">
             {/* CONTROLS FOR SELECTED ITEM */}
             {selectedItemId && (
                 <div className="bg-white p-4 rounded-lg border border-amber-200 shadow-sm">
                     <div className="flex justify-between mb-2"><span className="text-xs font-bold uppercase text-amber-600">Adjust Item</span><button onClick={() => setSelectedItemId(null)}><X size={14}/></button></div>
                     <div className="grid grid-cols-2 gap-4">
                         <div><label className="text-[10px] uppercase text-neutral-400">Size</label><input type="range" min="0.5" max="2" step="0.1" className="w-full" onChange={(e) => updateRoomItem(selectedItemId, 'scale', Number(e.target.value))} /></div>
                         <div><label className="text-[10px] uppercase text-neutral-400">Rotation</label><input type="range" min="-180" max="180" className="w-full" onChange={(e) => updateRoomItem(selectedItemId, 'rotation', Number(e.target.value))} /></div>
                         <div><label className="text-[10px] uppercase text-neutral-400">Pos X</label><input type="range" min="0" max="100" className="w-full" onChange={(e) => updateRoomItem(selectedItemId, 'x', Number(e.target.value))} /></div>
                         <div><label className="text-[10px] uppercase text-neutral-400">Pos Y</label><input type="range" min="0" max="100" className="w-full" onChange={(e) => updateRoomItem(selectedItemId, 'y', Number(e.target.value))} /></div>
                     </div>
                 </div>
             )}

            {!results ? (
              <div className="h-full flex flex-col items-center justify-center text-neutral-400 p-12 border-2 border-dashed border-neutral-200 rounded-xl"><p>AI suggestions will appear here</p></div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h3 className="text-xl font-serif mb-6 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-500"></span>Analysis Complete</h3>
                {dimensions && (<div className="bg-neutral-100 p-4 rounded-lg mb-6 flex items-center gap-4"><div className="bg-white p-2 rounded-full text-neutral-600"><Ruler size={24} /></div><div><p className="text-xs font-bold uppercase tracking-wider text-neutral-500">Estimated Room Size</p><p className="font-mono text-lg font-medium">{dimensions.width} x {dimensions.length}</p></div></div>)}
                <div className="space-y-4">
                  {results.map((product, idx) => (
                      <motion.div key={product.id} initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: idx * 0.2 }} className="flex gap-4 bg-white p-4 rounded-lg shadow-sm border border-neutral-100">
                        <img src={product.images[0]} className="w-20 h-20 object-cover rounded" />
                        <div className="flex-1">
                          <h4 className="font-serif">{product.name}</h4>
                          <div className="flex justify-between items-center mt-2">
                            <span className="font-medium">PKR {product.price.toLocaleString()}</span>
                            {/* FIXED BUTTON */}
                            <button onClick={() => addToRoom(product)} className="text-xs bg-neutral-900 text-white px-3 py-2 rounded hover:bg-amber-600 transition-colors font-bold uppercase tracking-wider">Add to Room</button>
                          </div>
                        </div>
                      </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// FIXED COMPONENT: DESIGNER STUDIO
// ==========================================

const DesignerStudio = () => {
  const { products, designerAssets } = useContext(StoreContext); // Using Assets from Context
  const [setupMode, setSetupMode] = useState(true);
  const [dimensions, setDimensions] = useState({ width: 15, depth: 12, height: 10 });
  const [activeTab, setActiveTab] = useState('walls'); 
  const [selectedSurface, setSelectedSurface] = useState('wallBack'); 
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [showSummary, setShowSummary] = useState(false);
  const [lightingMode, setLightingMode] = useState('day');

  const [textures, setTextures] = useState({
      wallLeft: { type: 'color', value: '#e0e0e0', name: 'Dove Wing', price: 160 },
      wallRight: { type: 'color', value: '#e0e0e0', name: 'Dove Wing', price: 160 },
      wallBack: { type: 'color', value: '#fdfbf7', name: 'Swiss Coffee', price: 150 },
      floor: { type: 'image', value: 'https://images.unsplash.com/photo-1516455590571-18256e5bb9ff?auto=format&fit=crop&q=80&w=400', name: 'French Oak', price: 850 },
      ceiling: { type: 'color', value: '#ffffff', name: 'Matte White', price: 100 },
  });

  const [placedItems, setPlacedItems] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef(null);
  const [rotation, setRotation] = useState({ x: -25, y: 35 });
  const [zoom, setZoom] = useState(0.85);
  const PX_PER_FT = 40;

  // FIXED: Logic for Applying Textures (Distinguishes Images vs Colors)
  const handleTextureApply = (asset) => {
    // Check if it's an image (has 'url' or 'image' property)
    const imageUrl = asset.url || asset.image;
    const newVal = imageUrl
        ? { type: 'image', value: imageUrl, name: asset.name, price: asset.price } 
        : { type: 'color', value: asset.value, name: asset.name, price: asset.price };
    
    setTextures(prev => ({ ...prev, [selectedSurface]: newVal }));
  };

  const addItemToRoom = (product) => {
    const newId = Date.now().toString() + Math.random().toString(36).substr(2, 5);
    setPlacedItems(prev => [...prev, { id: newId, product, x: dimensions.width / 2, z: dimensions.depth / 2, rotation: 0, scale: 1.0 }]);
    setSelectedItemId(newId);
  };

  const updateItem = (prop, val) => {
      if (!selectedItemId) return;
      setPlacedItems(prev => prev.map(item => {
          if (item.id !== selectedItemId) return item;
          let newVal = val;
          if (prop === 'x') newVal = Math.max(0, Math.min(dimensions.width, val));
          if (prop === 'z') newVal = Math.max(0, Math.min(dimensions.depth, val));
          return { ...item, [prop]: newVal };
      }));
  };
  
  const removeItem = () => {
      if (!selectedItemId) return;
      setPlacedItems(prev => prev.filter(item => item.id !== selectedItemId));
      setSelectedItemId(null);
  };

  // Drag Logic
  const handleMouseDownItem = (e, id) => {
    e.stopPropagation(); e.preventDefault();
    setSelectedItemId(id); setIsDragging(true);
    const item = placedItems.find(i => i.id === id);
    if (!item) return;
    dragRef.current = { startX: e.clientX, startY: e.clientY, itemX: item.x, itemZ: item.z };
  };

  const handleGlobalMouseMove = (e) => {
    if (isDragging && selectedItemId && dragRef.current) {
        e.preventDefault();
        const deltaXFt = (e.clientX - dragRef.current.startX) / PX_PER_FT; 
        const deltaZFt = (e.clientY - dragRef.current.startY) / PX_PER_FT; 
        updateItem('x', dragRef.current.itemX + deltaXFt);
        updateItem('z', dragRef.current.itemZ + deltaZFt);
    } else if (e.buttons === 1 && !isDragging) {
        setRotation(prev => ({ x: Math.max(-90, Math.min(0, prev.x - e.movementY * 0.5)), y: prev.y + e.movementX * 0.5 }));
    }
  };

  const handleGlobalMouseUp = () => { setIsDragging(false); dragRef.current = null; };
  const selectedItem = placedItems.find(i => i.id === selectedItemId);

  if (setupMode) return <div className="pt-32 text-center"><Button onClick={() => setSetupMode(false)}>Start Designing</Button></div>;

  return (
    <div className="pt-24 h-screen flex flex-col bg-neutral-100 overflow-hidden font-sans">
      <div className="bg-white border-b border-neutral-200 px-6 py-3 flex justify-between items-center z-20 shadow-sm relative">
          <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-amber-600 font-bold tracking-widest uppercase text-xs border-r border-neutral-200 pr-6"><Box size={18}/> <span>Studio</span></div>
              <div className="flex bg-neutral-100 p-1 rounded-lg">{['walls', 'floor', 'ceiling', 'furniture'].map(t => (<button key={t} onClick={() => { setActiveTab(t); if(t!=='furniture') setSelectedSurface(t==='walls'?'wallBack':t); }} className={`px-6 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-all ${activeTab === t ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500'}`}>{t}</button>))}</div>
          </div>
          <div className="flex gap-2"><button onClick={() => setLightingMode(l => l === 'day' ? 'night' : 'day')} className="px-4 py-2 bg-white border rounded text-xs font-bold uppercase">Toggle Light</button></div>
      </div>

      <div className="flex-1 flex overflow-hidden relative" onMouseMove={handleGlobalMouseMove} onMouseUp={handleGlobalMouseUp}>
          <div className="w-80 bg-white border-r border-neutral-200 flex flex-col z-10 shadow-xl relative shrink-0 h-full overflow-y-auto p-6">
              {activeTab === 'walls' && (
                  <div className="space-y-8">
                      <div className="grid grid-cols-3 gap-2">{['wallBack', 'wallLeft', 'wallRight'].map(w => (<button key={w} onClick={() => setSelectedSurface(w)} className={`py-3 text-[10px] font-bold uppercase border rounded ${selectedSurface === w ? 'border-amber-500 bg-amber-50' : ''}`}>{w.replace('wall', '')}</button>))}</div>
                      <p className="text-xs font-bold text-neutral-400">Paints</p>
                      <div className="grid grid-cols-4 gap-2">{designerAssets.paints.map(p => (<button key={p.id} onClick={() => handleTextureApply(p)} className="aspect-square rounded-full border" style={{ backgroundColor: p.value }} title={p.name}></button>))}</div>
                      <p className="text-xs font-bold text-neutral-400">Wallpapers</p>
                      <div className="grid grid-cols-2 gap-2">{designerAssets.wallpapers.map(wp => (<button key={wp.id} onClick={() => handleTextureApply(wp)} className="aspect-square bg-neutral-100"><img src={wp.url || wp.image} className="w-full h-full object-cover" /></button>))}</div>
                  </div>
              )}
              {activeTab === 'floor' && <div className="grid grid-cols-2 gap-2">{designerAssets.floors.map(f => (<button key={f.id} onClick={() => handleTextureApply(f)}><img src={f.url || f.image} className="w-full h-20 object-cover" /></button>))}</div>}
              {activeTab === 'ceiling' && <div className="grid grid-cols-2 gap-2">{designerAssets.ceilings.map(c => (<button key={c.id} onClick={() => handleTextureApply(c)} style={{background: c.value}} className="h-20 border"></button>))}</div>}
              {activeTab === 'furniture' && <div className="space-y-2">{products.map(p => (<button key={p.id} onClick={() => addItemToRoom(p)} className="w-full flex items-center gap-2 p-2 border rounded hover:bg-neutral-50"><img src={p.images[0]} className="w-10 h-10" /><span className="text-xs font-bold">{p.name}</span></button>))}</div>}
          </div>

          <div className="flex-1 relative bg-neutral-200 overflow-hidden flex items-center justify-center cursor-move" style={{ background: lightingMode === 'day' ? '#e0e0e0' : '#2a2a2a' }} onWheel={(e) => setZoom(prev => Math.max(0.4, Math.min(2.5, prev - e.deltaY * 0.001)))}>
              {/* 3D SCENE RENDERER */}
              <div style={{ perspective: '2500px', transform: `scale(${zoom}) translateY(50px)` }}>
                  <div className="relative shadow-2xl" style={{ width: `${dimensions.width * PX_PER_FT}px`, height: `${dimensions.height * PX_PER_FT}px`, transformStyle: 'preserve-3d', transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)` }}>
                        {/* FLOOR */}
                        <div className="absolute inset-0 bg-neutral-100 origin-bottom border" style={{ width: `${dimensions.width * PX_PER_FT}px`, height: `${dimensions.depth * PX_PER_FT}px`, transform: `rotateX(90deg) translateZ(0px) translateY(${dimensions.height * PX_PER_FT}px)`, background: textures.floor.type === 'image' ? `url(${textures.floor.value})` : textures.floor.value, backgroundSize: '300px', filter: lightingMode === 'night' ? 'brightness(0.5)' : 'brightness(1)' }}>
                            {placedItems.map((item) => (
                                <div key={item.id} onMouseDown={(e) => handleMouseDownItem(e, item.id)} className="absolute" style={{ left: `${item.x * PX_PER_FT}px`, top: `${item.z * PX_PER_FT}px`, width: '0px', height: '0px', transformStyle: 'preserve-3d' }}>
                                    {selectedItemId === item.id && <div className="absolute -translate-x-1/2 -translate-y-1/2 w-24 h-24 border-2 border-amber-500 rounded-full opacity-80" style={{ transform: 'rotateX(-90deg)' }}></div>}
                                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 origin-bottom" style={{ width: '140px', height: '140px', transform: `rotateX(-90deg) rotateY(${-item.rotation}deg) translateY(-10px)`, backgroundImage: `url(${item.product.images[0]})`, backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'bottom center' }}></div>
                                </div>
                            ))}
                        </div>
                        {/* BACK WALL */}
                        <div className="absolute inset-0 bg-white origin-center border" style={{ transform: `translateZ(${-dimensions.depth * PX_PER_FT / 2}px)`, background: textures.wallBack.type === 'image' ? `url(${textures.wallBack.value})` : textures.wallBack.value, backgroundSize: '400px', filter: lightingMode === 'night' ? 'brightness(0.6)' : 'brightness(1)' }}></div>
                        {/* LEFT WALL */}
                        <div className="absolute inset-0 bg-white origin-left border" style={{ transform: `rotateY(90deg) translateX(${-dimensions.depth * PX_PER_FT / 2}px) translateZ(${-dimensions.depth * PX_PER_FT / 2}px)`, width: `${dimensions.depth * PX_PER_FT}px`, background: textures.wallLeft.type === 'image' ? `url(${textures.wallLeft.value})` : textures.wallLeft.value, backgroundSize: '400px', filter: lightingMode === 'night' ? 'brightness(0.5)' : 'brightness(0.95)' }}></div>
                        {/* RIGHT WALL */}
                        <div className="absolute inset-0 bg-white origin-right border" style={{ transform: `rotateY(-90deg) translateX(${dimensions.depth * PX_PER_FT / 2}px) translateZ(${-dimensions.depth * PX_PER_FT / 2}px)`, width: `${dimensions.depth * PX_PER_FT}px`, background: textures.wallRight.type === 'image' ? `url(${textures.wallRight.value})` : textures.wallRight.value, backgroundSize: '400px', filter: lightingMode === 'night' ? 'brightness(0.5)' : 'brightness(0.95)' }}></div>
                  </div>
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
      <div className="flex justify-between items-center mb-12 border-b pb-6 border-neutral-100"><div><h1 className="text-3xl font-serif mb-2">My Account</h1><p className="text-neutral-500">Welcome back, {user.name}</p></div><Button variant="outline" onClick={() => { logout(); navigate('home'); }}>Sign Out</Button></div>
      <div className="grid md:grid-cols-3 gap-12">
        <div className="md:col-span-2 space-y-12"><section><h3 className="text-xl font-serif mb-6">My Wishlist ({wishlist.length})</h3>{wishlist.map(p => (<div key={p.id} className="flex gap-4 border p-4 rounded mb-2"><img src={p.images[0]} className="w-20 h-20 object-cover" /><div><h4 className="font-medium">{p.name}</h4><p className="text-sm text-neutral-500">PKR {p.price.toLocaleString()}</p></div></div>))}</section></div>
      </div>
    </div>
  );
};

const Checkout = ({ navigate }) => {
  const { cart, cartTotal, addOrder, setCart } = useContext(StoreContext);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', address: '', city: '', zip: '', card: '' });
  const handleChange = (e) => setFormData({...formData, [e.target.name]: e.target.value});
  const handleSubmit = async (e) => { e.preventDefault(); setLoading(true); setTimeout(() => { addOrder({ id: `ORD-${Date.now()}`, items: cart, total: cartTotal, date: new Date().toISOString(), status: 'Processing' }); setCart([]); setLoading(false); navigate('home'); }, 2000); };
  if (cart.length === 0) return <div className="pt-32 text-center">Cart Empty</div>;
  return (<div className="pt-24 pb-12 px-4 max-w-md mx-auto"><h2 className="text-2xl mb-6">Checkout</h2><form onSubmit={handleSubmit} className="space-y-4"><input required name="name" placeholder="Name" onChange={handleChange} className="w-full border p-3" /><Button type="submit" disabled={loading} className="w-full">{loading ? 'Processing...' : `Pay PKR ${cartTotal}`}</Button></form></div>);
};

const OrderTracking = () => {
  return <div className="pt-32 text-center">Order Tracking Module Placeholder</div>;
};

// ==========================================
// 5. ADMIN DASHBOARD (With NEW Studio Assets Manager)
// ==========================================

const AdminDashboard = () => {
  const [pin, setPin] = useState('');
  const [auth, setAuth] = useState(false);
  const [tab, setTab] = useState('products');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [uploading, setUploading] = useState(false);
  const [uploadingTarget, setUploadingTarget] = useState(null); 
  
  // Context
  const { 
    siteContent, updateSiteContent, products, addProduct, updateProduct, deleteProduct, 
    categories, addCategory, deleteCategory, styles, addStyle, deleteStyle, 
    orders, subscribers, uploadFile, uploadVideoFile,
    designerAssets, addStudioAsset, deleteStudioAsset // NEW Context functions
  } = useContext(StoreContext);
  
  // Form States
  const [currentProduct, setCurrentProduct] = useState({ id: '', name: '', price: '', category: '', style: 'Modern', images: [], description: '', richDescription: { story: '', materials: '', care: '', dimensions: '' } });
  const [heroForm, setHeroForm] = useState(siteContent.hero);
  const [videoForm, setVideoForm] = useState(siteContent.featuredVideo);
  const [promos, setPromos] = useState(siteContent.promotions || []);
  const [contactForm, setContactForm] = useState(siteContent.contact || {});
  const [styleForm, setStyleForm] = useState({ name: '', image: '', id: null });
  const [promoForm, setPromoForm] = useState({ title: '', subtitle: '', image: '', id: null });
  const [categoryForm, setCategoryForm] = useState({ name: '', image: '', id: null });

  // --- NEW: Studio Asset Form State ---
  const [assetTab, setAssetTab] = useState('paints'); // paints, wallpapers, floors, ceilings
  const [assetForm, setAssetForm] = useState({ name: '', value: '#ffffff', price: 0, image: '' });

  useEffect(() => { 
      setHeroForm(siteContent.hero); 
      setVideoForm(siteContent.featuredVideo);
      setPromos(siteContent.promotions || []);
      setContactForm(siteContent.contact || {});
  }, [siteContent]);

  // --- Product Handlers ---
  const openAddModal = () => { setModalMode('add'); setCurrentProduct({ name: '', price: '', category: 'furniture', style: 'Modern', images: [], description: '', richDescription: { story: '', materials: '', care: '', dimensions: '' } }); setShowModal(true); };
  const openEditModal = (product) => { setModalMode('edit'); setCurrentProduct(product); setShowModal(true); };
  const handleModalSave = (e) => { e.preventDefault(); const productData = { ...currentProduct, price: Number(currentProduct.price), rating: currentProduct.rating || 5.0 }; if (modalMode === 'add') addProduct(productData); else updateProduct(currentProduct.id, productData); setShowModal(false); };
  const handleProductImageUpload = async (e) => { const files = Array.from(e.target.files); if (files.length === 0) return; setUploading(true); const urls = await Promise.all(files.map(file => uploadFile(file, 'products'))); setUploading(false); setCurrentProduct(prev => ({ ...prev, images: [...(prev.images || []), ...urls.filter(u => u !== null)] })); };

  // --- Style/Category/Promo Handlers ---
  const handleSimpleUpload = async (e, setter, field = 'image') => { const file = e.target.files[0]; if(!file) return; setUploading(true); const url = await uploadFile(file, 'misc'); if(url) setter(prev => ({ ...prev, [field]: url })); setUploading(false); };
  const saveStyle = () => { if(styleForm.name && styleForm.image) { addStyle(styleForm); setStyleForm({ name: '', image: '', id: null }); } };
  const saveCategory = () => { if(categoryForm.name) { addCategory(categoryForm); setCategoryForm({ name: '', image: '', id: null }); } };
  const savePromo = () => { if(promoForm.title && promoForm.image) { const newPromo = { ...promoForm, id: promoForm.id || Date.now().toString() }; const newPromos = promoForm.id ? promos.map(p => p.id === promoForm.id ? newPromo : p) : [...promos, newPromo]; updateSiteContent('promotions', newPromos); setPromos(newPromos); setPromoForm({ title: '', subtitle: '', image: '', id: null }); } };

  // --- NEW: Studio Asset Handlers ---
  const handleAssetUpload = async (e) => {
      const file = e.target.files[0];
      if(!file) return;
      setUploading(true);
      const url = await uploadFile(file, 'assets');
      if(url) setAssetForm(prev => ({ ...prev, image: url, value: url })); // Use URL as value for images
      setUploading(false);
  };

  const handleSaveAsset = () => {
      if (!assetForm.name) return alert("Name is required");
      // For paints, value is hex color. For others, value is image URL.
      const finalValue = assetTab === 'paints' ? assetForm.value : assetForm.image;
      if (!finalValue) return alert("Color or Image is required");

      addStudioAsset(assetTab, {
          name: assetForm.name,
          value: finalValue, // Stores Hex or URL
          url: assetTab !== 'paints' ? finalValue : null, // Explicit URL for image types
          price: Number(assetForm.price)
      });
      setAssetForm({ name: '', value: '#ffffff', price: 0, image: '' });
  };

  if (!auth) return (
    <div className="h-screen flex items-center justify-center bg-neutral-900">
        <div className="bg-white p-12 max-w-md text-center shadow-2xl">
            <h2 className="text-2xl font-serif mb-2">Casa Admin</h2>
            <input type="password" placeholder="Enter PIN (CASA2025)" className="w-full p-4 border text-center tracking-[0.5em] mb-4" value={pin} onChange={(e) => setPin(e.target.value)} />
            <Button onClick={() => pin === 'CASA2025' ? setAuth(true) : alert('Access Denied')} className="w-full">Authenticate</Button>
            <div className="mt-4 text-xs text-neutral-400 cursor-pointer hover:text-white" onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'home' }))}>Return to Store</div>
        </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-neutral-50 pt-24 px-6 pb-20">
      <div className="max-w-[1600px] mx-auto">
        <header className="flex justify-between items-end mb-12 border-b border-neutral-200 pb-6">
            <div><h1 className="text-4xl font-serif text-neutral-900 mb-2">Command Center</h1><p className="text-neutral-500">Administrator Access</p></div>
            <Button variant="outline" onClick={() => { setAuth(false); window.dispatchEvent(new CustomEvent('navigate', { detail: 'home' })); }}>Exit to Store</Button>
        </header>
        
        <div className="flex gap-2 mb-8 border-b border-neutral-200 overflow-x-auto">
          {['products', 'studio assets', 'styles', 'promotions', 'content', 'categories'].map(t => (
              <button key={t} onClick={() => setTab(t)} className={`px-8 py-4 text-sm font-bold uppercase tracking-wider transition-all whitespace-nowrap ${tab === t ? 'bg-neutral-900 text-white' : 'text-neutral-500 hover:text-neutral-900'}`}>{t}</button>
          ))}
        </div>

        {/* --- NEW: STUDIO ASSETS TAB --- */}
        {tab === 'studio assets' && (
            <div className="bg-white p-8 shadow-sm border border-neutral-100">
                <div className="flex justify-between mb-8">
                    <h3 className="font-bold text-lg flex items-center gap-2"><Box size={20}/> Studio Materials Manager</h3>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {/* Left: Add New Asset Form */}
                    <div className="bg-neutral-50 p-6 rounded-xl border border-neutral-200 h-fit">
                        <h4 className="font-bold text-sm uppercase mb-4 text-neutral-500">Upload New Material</h4>
                        
                        {/* Asset Type Selector */}
                        <div className="grid grid-cols-2 gap-2 mb-4">
                            {['paints', 'wallpapers', 'floors', 'ceilings'].map(type => (
                                <button key={type} onClick={() => setAssetTab(type)} className={`p-2 text-xs uppercase font-bold rounded border ${assetTab === type ? 'bg-neutral-900 text-white border-neutral-900' : 'bg-white text-neutral-500'}`}>
                                    {type}
                                </button>
                            ))}
                        </div>

                        <div className="space-y-4">
                            <input placeholder="Material Name (e.g., Royal Blue)" className="w-full p-3 border rounded" value={assetForm.name} onChange={e => setAssetForm({...assetForm, name: e.target.value})} />
                            <input type="number" placeholder="Price per unit" className="w-full p-3 border rounded" value={assetForm.price} onChange={e => setAssetForm({...assetForm, price: e.target.value})} />
                            
                            {assetTab === 'paints' ? (
                                <div>
                                    <label className="text-xs font-bold uppercase text-neutral-400 block mb-1">Select Color</label>
                                    <div className="flex gap-2">
                                        <input type="color" className="h-12 w-12 p-0 border-0 rounded overflow-hidden cursor-pointer" value={assetForm.value} onChange={e => setAssetForm({...assetForm, value: e.target.value})} />
                                        <input className="flex-1 p-3 border rounded uppercase" value={assetForm.value} onChange={e => setAssetForm({...assetForm, value: e.target.value})} />
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <label className="text-xs font-bold uppercase text-neutral-400 block mb-1">Upload Texture Image</label>
                                    <div className="border-2 border-dashed border-neutral-300 p-4 rounded text-center hover:bg-white transition-colors cursor-pointer relative">
                                        {uploading ? <Loader className="animate-spin mx-auto" /> : <><Upload className="mx-auto text-neutral-400 mb-2" /><span className="text-xs text-neutral-500">Click to upload</span></>}
                                        <input type="file" className="absolute inset-0 opacity-0" onChange={handleAssetUpload} accept="image/*" />
                                    </div>
                                    {assetForm.image && <img src={assetForm.image} className="w-full h-32 object-cover mt-2 rounded border" />}
                                </div>
                            )}
                            
                            <Button onClick={handleSaveAsset} className="w-full mt-4">Save to Studio</Button>
                        </div>
                    </div>

                    {/* Right: List of Assets */}
                    <div className="md:col-span-2">
                        <h4 className="font-bold text-sm uppercase mb-4 text-neutral-500">Existing {assetTab}</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {designerAssets[assetTab] && designerAssets[assetTab].map(item => (
                                <div key={item.id} className="group relative border rounded-lg overflow-hidden bg-white">
                                    <div className="h-32 w-full bg-neutral-100">
                                        {assetTab === 'paints' ? (
                                            <div className="w-full h-full" style={{ backgroundColor: item.value }}></div>
                                        ) : (
                                            <img src={item.url || item.value} className="w-full h-full object-cover" />
                                        )}
                                    </div>
                                    <div className="p-3">
                                        <p className="font-bold text-sm truncate">{item.name}</p>
                                        <p className="text-xs text-neutral-500">PKR {item.price}</p>
                                    </div>
                                    <button onClick={() => deleteStudioAsset(assetTab, item.id)} className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:scale-110">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                            {(!designerAssets[assetTab] || designerAssets[assetTab].length === 0) && (
                                <div className="col-span-full text-center py-12 text-neutral-400">No assets found. Upload one to begin.</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        )}

        {tab === 'products' && (
          <div className="bg-white p-8 shadow-sm border border-neutral-100">
            <div className="flex justify-between mb-8 items-center"><h3 className="font-bold text-lg">Active Inventory</h3><Button onClick={openAddModal} className="text-xs"><Plus size={16} /> New Item</Button></div>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead><tr className="border-b text-xs font-bold uppercase text-neutral-400"><th className="pb-4">Product</th><th className="pb-4">Category</th><th className="pb-4">Price</th><th className="pb-4 text-right">Actions</th></tr></thead>
                    <tbody>{products.map(p => (
                        <tr key={p.id} className="border-b hover:bg-neutral-50"><td className="py-4 flex items-center gap-4"><img src={p.images[0]} className="w-12 h-12 object-cover" />{p.name}</td><td className="py-4 capitalize">{p.category}</td><td className="py-4">PKR {p.price}</td><td className="py-4 text-right"><button onClick={() => openEditModal(p)} className="mr-2"><Edit2 size={16} /></button><button onClick={() => deleteProduct(p.id)} className="text-red-500"><Trash2 size={16} /></button></td></tr>
                    ))}</tbody>
                </table>
            </div>
          </div>
        )}

        {/* Categories Tab */}
        {tab === 'categories' && (
             <div className="bg-white p-8 shadow-sm border border-neutral-100">
                 <h3 className="font-bold mb-6">Categories</h3>
                 <div className="flex gap-4 mb-8 items-end p-4 bg-neutral-50 rounded">
                     <div className="flex-1"><input placeholder="Name" className="w-full p-2 border" value={categoryForm.name} onChange={e => setCategoryForm({...categoryForm, name: e.target.value})} /></div>
                     <div className="flex-1"><input type="file" onChange={(e) => handleSimpleUpload(e, setCategoryForm)} /></div>
                     <Button onClick={saveCategory}>Add</Button>
                 </div>
                 <div className="grid grid-cols-4 gap-4">{categories.filter(c => c.id !== 'all').map(c => (<div key={c.id} className="border p-4 rounded relative text-center"><img src={c.image} className="w-full h-32 object-cover mb-2" /><h4 className="font-bold">{c.name}</h4><button onClick={() => deleteCategory(c.id)} className="absolute top-2 right-2 text-red-500"><Trash2 size={16}/></button></div>))}</div>
             </div>
        )}
        
        {/* Styles Tab */}
        {tab === 'styles' && (
             <div className="bg-white p-8 shadow-sm border border-neutral-100">
                 <h3 className="font-bold mb-6">Styles</h3>
                 <div className="flex gap-4 mb-8 items-end p-4 bg-neutral-50 rounded">
                     <div className="flex-1"><input placeholder="Name" className="w-full p-2 border" value={styleForm.name} onChange={e => setStyleForm({...styleForm, name: e.target.value})} /></div>
                     <div className="flex-1"><input type="file" onChange={(e) => handleSimpleUpload(e, setStyleForm)} /></div>
                     <Button onClick={saveStyle}>Add</Button>
                 </div>
                 <div className="grid grid-cols-4 gap-4">{styles.map(s => (<div key={s.id} className="border p-4 rounded relative text-center"><img src={s.image} className="w-full h-32 object-cover mb-2" /><h4 className="font-bold">{s.name}</h4><button onClick={() => deleteStyle(s.id)} className="absolute top-2 right-2 text-red-500"><Trash2 size={16}/></button></div>))}</div>
             </div>
        )}

        {/* Promotions Tab */}
        {tab === 'promotions' && (
             <div className="bg-white p-8 shadow-sm border border-neutral-100">
                 <h3 className="font-bold mb-6">Promotions</h3>
                 <div className="flex gap-4 mb-8 items-end p-4 bg-neutral-50 rounded">
                     <div className="flex-1"><input placeholder="Title" className="w-full p-2 border mb-2" value={promoForm.title} onChange={e => setPromoForm({...promoForm, title: e.target.value})} /><input placeholder="Subtitle" className="w-full p-2 border" value={promoForm.subtitle} onChange={e => setPromoForm({...promoForm, subtitle: e.target.value})} /></div>
                     <div className="flex-1"><input type="file" onChange={(e) => handleSimpleUpload(e, setPromoForm)} /></div>
                     <Button onClick={savePromo}>Add</Button>
                 </div>
                 <div className="grid grid-cols-3 gap-4">{promos.map(p => (<div key={p.id} className="border p-4 rounded relative"><img src={p.image} className="w-full h-24 object-cover mb-2" /><h4 className="font-bold">{p.title}</h4><p>{p.subtitle}</p></div>))}</div>
             </div>
        )}

        {/* Add/Edit Product Modal */}
        <AnimatePresence>
          {showModal && (
            <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
              <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} className="bg-white w-full max-w-4xl max-h-[90vh] relative z-10 overflow-hidden flex flex-col shadow-2xl">
                <div className="p-6 border-b flex justify-between items-center bg-neutral-50"><h3 className="font-serif text-xl">{modalMode === 'add' ? 'Add New Product' : 'Edit Product'}</h3><button onClick={() => setShowModal(false)}><X size={20} /></button></div>
                <div className="flex-1 overflow-y-auto p-8">
                    <form id="product-form" onSubmit={handleModalSave} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-2"><label className="text-xs font-bold uppercase text-neutral-500 block mb-2">Product Name</label><input className="w-full p-3 border rounded" value={currentProduct.name} onChange={e => setCurrentProduct({...currentProduct, name: e.target.value})} required /></div>
                            <div><label className="text-xs font-bold uppercase text-neutral-500 block mb-2">Price (PKR)</label><input type="number" className="w-full p-3 border rounded" value={currentProduct.price} onChange={e => setCurrentProduct({...currentProduct, price: e.target.value})} required /></div>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div><label className="text-xs font-bold uppercase text-neutral-500 block mb-2">Category</label><select className="w-full p-3 border rounded bg-white" value={currentProduct.category} onChange={e => setCurrentProduct({...currentProduct, category: e.target.value})}>{categories.filter(c => c.id !== 'all').map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}</select></div>
                            <div><label className="text-xs font-bold uppercase text-neutral-500 block mb-2">Style</label><select className="w-full p-3 border rounded bg-white" value={currentProduct.style} onChange={e => setCurrentProduct({...currentProduct, style: e.target.value})}>{styles.map(s => (<option key={s.id} value={s.id}>{s.name}</option>))}</select></div>
                        </div>
                        <div><label className="text-xs font-bold uppercase text-neutral-500 block mb-2">Images</label><input type="file" multiple onChange={handleProductImageUpload} className="mb-2" />{uploading && <p>Uploading...</p>}<div className="flex gap-2">{currentProduct.images && currentProduct.images.map((url, i) => <img key={i} src={url} className="w-20 h-20 object-cover border" />)}</div></div>
                    </form>
                </div>
                <div className="p-6 border-t bg-neutral-50 flex justify-end gap-4"><Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button><Button onClick={() => document.getElementById('product-form').requestSubmit()}>Save Product</Button></div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// ==========================================
// 6. MAIN CONTENT & APP ROOT
// ==========================================

const MainContent = () => {
  const [view, setView] = useState('home');
  const [showWelcome, setShowWelcome] = useState(true);
  const [emailInput, setEmailInput] = useState('');
  const { cart, setCartOpen, products, categories, styles, selectedCategory, setSelectedCategory, searchQuery, siteContent, selectedStyle, setSelectedStyle, isLoading, addSubscriber } = useContext(StoreContext);

  const handleNavigation = (destination) => {
    if (destination === view) return;
    window.history.pushState({ view: destination }, '', `?view=${destination}`);
    setView(destination);
    if(destination === 'shop') { setSelectedCategory('all'); setSelectedStyle('all'); }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    if (!window.history.state) window.history.replaceState({ view: 'home' }, '', window.location.search || '?view=home');
    const handlePopState = (event) => { if (event.state && event.state.view) setView(event.state.view); else setView('home'); };
    const handleCustomNavigate = (e) => handleNavigation(e.detail);
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('navigate', handleCustomNavigate);
    return () => { window.removeEventListener('popstate', handlePopState); window.removeEventListener('navigate', handleCustomNavigate); };
  }, []);

  const handleSubscribe = () => { if(emailInput && emailInput.includes('@')) { addSubscriber(emailInput); setEmailInput(''); } else { alert("Invalid email"); } };
  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesStyle = selectedStyle === 'all' || p.style === selectedStyle;
    const matchesSearch = (p.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch && matchesStyle;
  });

  const renderView = () => {
    if (isLoading) return <div className="h-screen flex items-center justify-center"><Loader className="animate-spin" size={40} /></div>;
    switch(view) {
      case 'home': return (
          <>
            <Hero navigate={handleNavigation} />
            <Section title="Shop by Aesthetic">
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">{styles.map((style) => (<div key={style.id} className="relative h-64 group overflow-hidden cursor-pointer bg-neutral-200" onClick={() => { handleNavigation('shop'); setSelectedCategory('all'); setSelectedStyle(style.id); }}><img src={style.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" /><div className="absolute inset-0 bg-black/30 flex items-center justify-center"><h3 className="text-white font-serif text-2xl tracking-wide">{style.name}</h3></div></div>))}</div>
            </Section>
            <Section title="Featured Collection" className="bg-neutral-50"><div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">{products.slice(0, 3).map(p => <ProductCard key={p.id} product={p} />)}</div><div className="mt-12 text-center"><Button variant="outline" onClick={() => { handleNavigation('shop'); setSelectedCategory('all'); }}>View All Products</Button></div></Section>
            <section className="py-20 bg-neutral-50 px-6"><div className="max-w-4xl mx-auto text-center"><h2 className="text-3xl font-serif mb-4">Join the Inner Circle</h2><p className="text-neutral-600 mb-8">Subscribe to receive early access.</p><div className="flex max-w-md mx-auto gap-2"><input value={emailInput} onChange={(e) => setEmailInput(e.target.value)} placeholder="Email Address" className="flex-1 p-3 border border-neutral-300 outline-none" /><Button onClick={handleSubscribe}>Subscribe</Button></div></div></section>
          </>
        );
      case 'shop': return (
          <div className="pt-24 px-6 md:px-12 max-w-7xl mx-auto min-h-screen">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6"><div><h1 className="text-4xl font-serif mb-2">The Collection</h1></div><div className="flex gap-2 overflow-x-auto pb-2"><button onClick={() => setSelectedStyle('all')} className={`px-4 py-2 rounded-full text-xs uppercase tracking-widest ${selectedStyle === 'all' ? 'bg-black text-white' : 'bg-neutral-100'}`}>All Styles</button>{styles.map(style => (<button key={style.id} onClick={() => setSelectedStyle(style.id)} className={`px-4 py-2 rounded-full text-xs uppercase tracking-widest ${selectedStyle === style.id ? 'bg-black text-white' : 'bg-neutral-100'}`}>{style.name}</button>))}</div></div>
            <div className="flex overflow-x-auto gap-4 mb-12 pb-4 justify-start md:justify-center">{categories.map(cat => (<button key={cat.id} onClick={() => setSelectedCategory(cat.id)} className={`whitespace-nowrap px-6 py-2 border transition-colors uppercase text-sm tracking-wider ${selectedCategory === cat.id ? 'bg-neutral-900 text-white' : 'border-neutral-200'}`}>{cat.name}</button>))}</div>
            <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8"><AnimatePresence mode="popLayout">{filteredProducts.map(p => (<motion.div key={p.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><ProductCard product={p} /></motion.div>))}</AnimatePresence></div>
          </div>
        );
      case 'designer': return <DesignerStudio />;
      case 'profile': return <UserProfile navigate={handleNavigation} />;
      case 'visualizer': return <RoomVisualizer />;
      case 'track': return <OrderTracking />;
      case 'checkout': return <Checkout navigate={handleNavigation} />;
      case 'admin': return <AdminDashboard />;
      default: return <div className="pt-32 text-center">Page Not Found</div>;
    }
  };

  if (view === 'admin') return <AdminDashboard />;

  return (
    <div className="font-sans text-neutral-800 bg-white min-h-screen overflow-hidden">
      <AnimatePresence>{showWelcome && <WelcomeScreen onComplete={() => setShowWelcome(false)} />}</AnimatePresence>
      <Navbar onNavigate={handleNavigation} cartCount={cart.length} openCart={() => setCartOpen(true)} currentView={view} />
      <NavigationDrawer onNavigate={handleNavigation} />
      <CartDrawer />
      <ProductDetailModal />
      <AuthModal />
      <NotificationToast />
      <main>{renderView()}</main>
      <footer className="bg-neutral-950 text-neutral-500 py-16 px-6 border-t border-neutral-900">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12">
            <div><h4 className="text-white font-serif text-xl mb-6">CASA ELEGANCE</h4><p className="text-sm">Redefining luxury through minimalist design.</p></div>
            <div><h5 className="text-white uppercase tracking-widest text-xs font-bold mb-6">Support</h5><ul className="space-y-3 text-sm"><li onClick={() => setView('track')} className="cursor-pointer hover:text-white">Track Order</li><li onClick={() => setView('admin')} className="cursor-pointer hover:text-white">Admin Login</li></ul></div>
        </div>
      </footer>
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