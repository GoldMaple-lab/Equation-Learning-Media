import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Calculator, Users, Home, ChevronRight, ChevronLeft, CheckCircle, 
  XCircle, Menu, X, Award, PlayCircle, Lock, LogOut, Edit, Save, ArrowRight, UserPlus, LogIn, Trash2, PlusCircle
} from 'lucide-react';

// Firebase Imports
import { auth, db } from './firebase'; 
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "firebase/auth";
import { collection, getDocs, doc, updateDoc, setDoc } from "firebase/firestore";

// --- 10 บท ---
const SEED_DATA = [
  {
    id: "1",
    title: "บทที่ 1: ความรู้เบื้องต้นและสัญลักษณ์",
    summary: "ทำความรู้จักกับอสมการและสัญลักษณ์ทางคณิตศาสตร์พื้นฐาน",
    content: "อสมการ (Inequality) คือประโยคสัญลักษณ์ที่แสดงความสัมพันธ์ของจำนวนที่ไม่เท่ากัน โดยใช้เครื่องหมายต่างๆ ดังนี้\n• < น้อยกว่า (เช่น x < 5)\n• > มากกว่า (เช่น x > 5)\n• ≤ น้อยกว่าหรือเท่ากับ (ไม่เกิน)\n• ≥ มากกว่าหรือเท่ากับ (ไม่น้อยกว่า)\n• ≠ ไม่เท่ากับ",
    quiz: [
      { q: "สัญลักษณ์ใดแทนคำว่า 'ไม่เกิน' ?", options: ["<", ">", "≤", "≥"], ans: 2 },
      { q: "ข้อใดเป็นอสมการ?", options: ["2x + 5 = 10", "3x - 1 > 8", "x + y", "5 + 5 = 10"], ans: 1 },
      { q: "x ≠ 5 หมายความว่าอย่างไร?", options: ["x ต้องเป็น 5", "x เป็นอะไรก็ได้ที่ไม่ใช่ 5", "x ต้องน้อยกว่า 5", "x ต้องมากกว่า 5"], ans: 1 }
    ]
  },
  {
    id: "2",
    title: "บทที่ 2: กราฟบนเส้นจำนวน",
    summary: "การเขียนกราฟแสดงคำตอบของอสมการบนเส้นจำนวน",
    content: "การแสดงคำตอบบนเส้นจำนวนมี 2 แบบหลัก:\n1. วงกลมโปร่ง: ใช้กับ < หรือ > (ไม่รวมค่าตัวเลขนั้น)\n2. วงกลมทึบ: ใช้กับ ≤ หรือ ≥ (รวมค่าตัวเลขนั้น)",
    quiz: [
      { q: "วงกลมทึบใช้กับเครื่องหมายใด?", options: ["<", ">", "≠", "≥"], ans: 3 },
      { q: "x > 3 กราฟจะมีลักษณะอย่างไร?", options: ["วงกลมทึบที่ 3 ชี้ไปทางขวา", "วงกลมโปร่งที่ 3 ชี้ไปทางขวา", "วงกลมทึบที่ 3 ชี้ไปทางซ้าย", "วงกลมโปร่งที่ 3 ชี้ไปทางซ้าย"], ans: 1 },
      { q: "วงกลมโปร่งหมายความว่าอย่างไร?", options: ["รวมค่านั้นด้วย", "ไม่รวมค่านั้น", "ค่าที่เป็นศูนย์", "ไม่มีข้อถูก"], ans: 1 }
    ]
  },
  {
    id: "3",
    title: "บทที่ 3: สมบัติการบวกและการลบ",
    summary: "กฎพื้นฐานในการย้ายข้างด้วยการบวกและการลบ",
    content: "หลักการสำคัญ: เราสามารถบวกหรือลบจำนวนที่เท่ากันทั้งสองข้างของอสมการได้ โดยเครื่องหมายไม่เปลี่ยน\n\nตัวอย่าง: x - 5 > 10\nวิธีทำ: นำ 5 มาบวกทั้งสองข้าง -> x - 5 + 5 > 10 + 5\nคำตอบ: x > 15",
    quiz: [
      { q: "ถ้า x - 3 > 7 แล้ว x มีค่าเท่าใด?", options: ["x > 4", "x > 10", "x < 10", "x > 21"], ans: 1 },
      { q: "เมื่อนำจำนวนมาบวกทั้งสองข้าง เครื่องหมายจะเป็นอย่างไร?", options: ["กลับด้าน", "เหมือนเดิม", "หายไป", "เปลี่ยนเป็นเท่ากับ"], ans: 1 },
      { q: "จงแก้สมการ x + 4 ≤ -2", options: ["x ≤ 2", "x ≤ -6", "x ≥ -2", "x ≥ 6"], ans: 1 }
    ]
  },
  {
    id: "4",
    title: "บทที่ 4: สมบัติการคูณและการหาร",
    summary: "กฎเหล็กของการคูณด้วยจำนวนลบ",
    content: "ข้อควรระวัง! เมื่อนำ 'จำนวนลบ' มาคูณหรือหารทั้งสองข้าง 'ต้องกลับเครื่องหมายอสมการเป็นตรงกันข้าม'\n\nตัวอย่าง: -2x < 10\nวิธีทำ: หารด้วย -2 ทั้งสองข้าง (กลับเครื่องหมาย < เป็น >)\nคำตอบ: x > -5",
    quiz: [
      { q: "เมื่อคูณด้วยจำนวนลบ เครื่องหมายจะเป็นอย่างไร?", options: ["เหมือนเดิม", "กลับด้าน", "เป็นเครื่องหมายเท่ากับ", "ไม่มีข้อถูก"], ans: 1 },
      { q: "จงแก้อสมการ -3x ≥ 9", options: ["x ≥ -3", "x ≤ -3", "x ≥ 3", "x ≤ 3"], ans: 1 },
      { q: "ถ้า x/2 < 4 แล้ว x คือ?", options: ["x < 2", "x < 8", "x > 8", "x < 6"], ans: 1 }
    ]
  },
  {
    id: "5",
    title: "บทที่ 5: การแก้อสมการหลายขั้นตอน",
    summary: "การประยุกต์ใช้สมบัติการบวก ลบ คูณ หาร ร่วมกัน",
    content: "ลำดับการแก้:\n1. กำจัดตัวเลขที่บวกหรือลบอยู่กับตัวแปรก่อน (ย้ายข้างไป)\n2. กำจัดสัมประสิทธิ์หน้าตัวแปร (คูณหรือหาร) และระวังเครื่องหมายถ้าเป็นจำนวนลบ\n\nโจทย์: 2x + 5 < 15\n1. ย้าย 5 ไปลบ: 2x < 10\n2. ย้าย 2 ไปหาร: x < 5",
    quiz: [
      { q: "คำตอบของ 3x + 1 > 10 คือ?", options: ["x > 3", "x > 9", "x < 3", "x > 3.33"], ans: 0 },
      { q: "จงแก้ 5 - x < 2", options: ["x < 3", "x > 3", "x < -3", "x > -3"], ans: 1 },
      { q: "ขั้นตอนแรกในการแก้ 4x - 8 ≤ 12 คือ?", options: ["หารด้วย 4", "บวกด้วย 8", "ลบด้วย 12", "คูณด้วย 4"], ans: 1 }
    ]
  },
  {
    id: "6",
    title: "บทที่ 6: อสมการที่มีตัวแปรทั้งสองข้าง",
    summary: "เทคนิคการจัดกลุ่มตัวแปร",
    content: "หลักการ: ให้ย้ายพจน์ที่มีตัวแปรไปอยู่ฝั่งเดียวกัน และตัวเลขไปอยู่อีกฝั่งหนึ่ง\n\nตัวอย่าง: 5x + 2 > 3x + 10\nย้าย 3x มาลบฝั่งซ้าย: 5x - 3x > 10 - 2\nจะได้: 2x > 8 -> x > 4",
    quiz: [
      { q: "จงแก้ 4x > 2x + 6", options: ["x > 3", "x > 2", "x < 3", "x = 3"], ans: 0 },
      { q: "ผลลัพธ์ของ x + 5 < 2x - 1 คือ?", options: ["x > 6", "x < 6", "x > 4", "x < 4"], ans: 0 },
      { q: "ข้อใดคือวิธีการย้ายข้างที่ถูกต้องสำหรับ 3x = x + 4", options: ["นำ x มาบวกฝั่งซ้าย", "นำ x มาลบฝั่งซ้าย", "นำ 3x ไปลบฝั่งขวา", "ถูกทั้งขและค"], ans: 3 }
    ]
  },
  {
    id: "7",
    title: "บทที่ 7: อสมการที่เป็นเศษส่วน",
    summary: "การจัดการกับตัวส่วน ครน. และวงเล็บ",
    content: "เทคนิค: นำ ค.ร.น. ของตัวส่วนคูณตลอดอสมการเพื่อกำจัดเศษส่วน ทำให้คิดเลขง่ายขึ้น\n\nตัวอย่าง: x/2 + x/3 > 5\nค.ร.น. ของ 2 และ 3 คือ 6 -> คูณ 6 ตลอด\n3x + 2x > 30 -> 5x > 30 -> x > 6",
    quiz: [
      { q: "ค.ร.น. ของส่วนในอสมการ x/3 + x/4 > 1 คือ?", options: ["7", "12", "1", "34"], ans: 1 },
      { q: "จงแก้ x/2 > 5", options: ["x > 2.5", "x > 10", "x < 10", "x > 7"], ans: 1 },
      { q: "ถ้า (x+1)/3 ≤ 2 ค่า x คือ?", options: ["x ≤ 5", "x ≤ 6", "x ≤ 7", "x ≤ 1"], ans: 0 }
    ]
  },
  {
    id: "8",
    title: "บทที่ 8: โจทย์ปัญหาอสมการ",
    summary: "การแปลความหมายโจทย์ภาษาไทยเป็นประโยคสัญลักษณ์",
    content: "คำสำคัญที่พบบ่อย:\n• อย่างน้อย = มากกว่าหรือเท่ากับ (≥)\n• อย่างมาก = น้อยกว่าหรือเท่ากับ (≤)\n• เกิน = มากกว่า (>)\n• ไม่ถึง = น้อยกว่า (<)",
    quiz: [
      { q: "'มีเงินอย่างน้อย 500 บาท' เขียนเป็นสัญลักษณ์ได้ว่า?", options: ["x < 500", "x > 500", "x ≤ 500", "x ≥ 500"], ans: 3 },
      { q: "'อายุไม่ถึง 18 ปี' เขียนว่า?", options: ["x < 18", "x ≤ 18", "x > 18", "x ≥ 18"], ans: 0 },
      { q: "สามเท่าของเลขจำนวนหนึ่งรวมกับ 5 มีค่าไม่เกิน 20", options: ["3x + 5 < 20", "3x + 5 ≤ 20", "3(x+5) ≤ 20", "3x + 5 ≥ 20"], ans: 1 }
    ]
  },
  {
    id: "9",
    title: "บทที่ 9: อสมการเชิงเส้นสองตัวแปร",
    summary: "บทนำสู่อสมการที่มีทั้ง x และ y",
    content: "รูปทั่วไป: Ax + By + C < 0 (หรือเครื่องหมายอื่นๆ)\nคำตอบของอสมการสองตัวแปรจะไม่ใช่ค่าเดียว แต่เป็น 'อาณาบริเวณ (Area)' บนกราฟระนาบ X-Y",
    quiz: [
      { q: "รูปทั่วไปของอสมการเชิงเส้นสองตัวแปรคือ?", options: ["Ax + By < C", "Ax² + By < C", "Ax + B = 0", "y = mx + c"], ans: 0 },
      { q: "คำตอบของอสมการสองตัวแปรมีลักษณะอย่างไร?", options: ["จุดเดียว", "เส้นตรง", "พื้นที่ระบายสี", "ไม่มีคำตอบ"], ans: 2 },
      { q: "จุด (0,0) อยู่ในอสมการ x + y < 5 หรือไม่?", options: ["อยู่", "ไม่อยู่", "สรุปไม่ได้", "ผิดทุกข้อ"], ans: 0 }
    ]
  },
  {
    id: "10",
    title: "บทที่ 10: กราฟระบบอสมการ",
    summary: "การหาพื้นที่คำตอบร่วม (Intersection) ของกราฟ",
    content: "เมื่อมีอสมการมากกว่า 1 ประโยค (ระบบอสมการ) คำตอบคือพื้นที่ที่กราฟของทุกอสมการ 'ซ้อนทับกัน (Overlap)'\n\nขั้นตอน: วาดกราฟทีละเส้น -> หาทิศทางแรงเงา -> หาพื้นที่ที่แรงเงาซ้อนกันทั้งหมด",
    quiz: [
      { q: "คำตอบของระบบอสมการคือส่วนใด?", options: ["พื้นที่ทั้งหมด", "พื้นที่ที่ซ้อนทับกัน", "เส้นขอบ", "จุดกำเนิด"], ans: 1 },
      { q: "ถ้ากราฟไม่ซ้อนทับกันเลย แสดงว่า?", options: ["มีคำตอบมากมาย", "ไม่มีคำตอบ", "คำตอบเป็น 0", "กราฟผิด"], ans: 1 },
      { q: "เส้นทึบใช้กับเครื่องหมายใดในระบบอสมการ?", options: ["<, >", "≤, ≥", "=", "≠"], ans: 1 }
    ]
  }
];

// --- Component: Login / Register Page ---
const AuthPage = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegister) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') setError('อีเมลนี้ถูกใช้งานแล้ว');
      else if (err.code === 'auth/invalid-email') setError('รูปแบบอีเมลไม่ถูกต้อง');
      else if (err.code === 'auth/weak-password') setError('รหัสผ่านต้องมีความยาว 6 ตัวอักษรขึ้นไป');
      else setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md animate-fade-in">
        <div className="text-center mb-6">
          <div className="bg-indigo-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
             <Calculator className="text-white h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">
            {isRegister ? 'สมัครสมาชิก' : 'เข้าสู่ระบบ'}
          </h2>
          <p className="text-gray-500">Equation Learning Media</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">อีเมล</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="user@example.com" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">รหัสผ่าน</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="รหัสผ่าน (6 ตัวขึ้นไป)" required />
          </div>
          {error && <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">{error}</div>}
          <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white py-2.5 rounded-lg hover:bg-indigo-700 font-bold shadow transition flex justify-center items-center gap-2">
            {loading ? 'กำลังโหลด...' : (isRegister ? <><UserPlus size={18}/> สมัครสมาชิก</> : <><LogIn size={18}/> เข้าสู่ระบบ</>)}
          </button>
        </form>

        <div className="mt-6 text-center border-t pt-4">
          <p className="text-sm text-gray-600">
            {isRegister ? 'มีบัญชีอยู่แล้ว?' : 'ยังไม่มีบัญชี?'}
            <button onClick={() => { setIsRegister(!isRegister); setError(''); }} className="ml-2 text-indigo-600 font-bold hover:underline focus:outline-none">
              {isRegister ? 'เข้าสู่ระบบ' : 'สมัครสมาชิกใหม่'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

// --- Component: Main App ---
const App = () => {
  const [user, setUser] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [quizResults, setQuizResults] = useState({});

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        const role = currentUser.email === "admin@gmail.com" ? "admin" : "user";
        setUser({ ...currentUser, role: role, username: currentUser.email.split('@')[0] });
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "lessons"));
        const loadedLessons = [];
        querySnapshot.forEach((doc) => {
          loadedLessons.push({ id: doc.id, ...doc.data() });
        });
        if (loadedLessons.length > 0) {
          loadedLessons.sort((a, b) => parseInt(a.id) - parseInt(b.id));
          setLessons(loadedLessons);
        }
      } catch (error) {
        console.error("Error loading lessons:", error);
      }
    };
    if (user) fetchLessons();
  }, [user]);

  const handleUpdateLesson = async (id, updatedData) => {
    try {
      const lessonRef = doc(db, "lessons", id.toString());
      await updateDoc(lessonRef, updatedData);
      setLessons(prev => prev.map(l => l.id === id ? { ...l, ...updatedData } : l));
      alert("บันทึกข้อมูลเรียบร้อย!");
    } catch (error) {
      console.error("Error updating:", error);
      alert("เกิดข้อผิดพลาดในการบันทึก");
    }
  };

  const seedDatabase = async () => {
    if (!window.confirm("ยืนยันการอัพโหลดบทเรียนทั้ง 10 บท? (ข้อมูลเดิมจะถูกทับ)")) return;
    try {
      for (const lesson of SEED_DATA) {
        await setDoc(doc(db, "lessons", lesson.id), lesson);
      }
      alert("อัพโหลดบทเรียนครบ 10 บทเรียบร้อย! กรุณารีเฟรชหน้าจอ");
      window.location.reload();
    } catch (e) {
      console.error(e);
      alert("เกิดข้อผิดพลาดในการอัพโหลด");
    }
  };

  const handleLogout = async () => {
    if(window.confirm("ต้องการออกจากระบบหรือไม่?")) {
      await signOut(auth);
      setQuizResults({});
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center bg-gray-50 text-indigo-600 font-bold text-xl">กำลังโหลดข้อมูล...</div>;
  if (!user) return <AuthPage />;

  const totalScore = Object.values(quizResults).reduce((a, b) => a + b, 0);
  const maxScore = lessons.length * 3;
  const progressPercent = lessons.length > 0 ? Math.round((Object.keys(quizResults).length / lessons.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      {user.role === 'admin' && lessons.length === 0 && (
         <button onClick={seedDatabase} className="fixed bottom-4 right-4 bg-red-600 text-white px-6 py-4 rounded-full shadow-2xl z-50 animate-bounce font-bold border-4 border-white">
           ⚠️ กดปุ่มนี้เพื่อโหลดบทเรียน 10 บท
         </button>
      )}

      <nav className="bg-indigo-600 text-white shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setActiveTab('home')}>
              <Calculator className="h-8 w-8 text-yellow-300" />
              <span className="font-bold text-xl hidden sm:block">Equation Media</span>
              {user.role === 'admin' && <span className="bg-red-500 text-xs px-2 py-0.5 rounded-full font-bold ml-2">ADMIN</span>}
            </div>
            <div className="hidden md:flex items-center space-x-4">
               {['home', 'lessons', 'about'].map(key => (
                 <button key={key} onClick={() => setActiveTab(key)} className={`px-3 py-2 rounded-md text-sm font-medium transition ${activeTab === key ? 'bg-indigo-700' : 'hover:bg-indigo-500'}`}>
                   {key === 'home' ? 'หน้าแรก' : key === 'lessons' ? 'บทเรียน' : 'ผู้จัดทำ'}
                 </button>
               ))}
               <div className="ml-4 border-l border-indigo-500 pl-4 flex items-center gap-3">
                 <div className="text-right text-xs">
                    <div className="font-bold">{user.username}</div>
                    <div className="text-indigo-200">{user.role.toUpperCase()}</div>
                 </div>
                 <button onClick={handleLogout} className="p-2 bg-indigo-700 rounded-full hover:bg-red-500 transition"><LogOut size={16} /></button>
               </div>
            </div>
            <div className="-mr-2 flex md:hidden">
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 rounded-md hover:bg-indigo-500">
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden bg-indigo-700 px-2 pt-2 pb-3 space-y-1 shadow-inner">
             {['home', 'lessons', 'about'].map(key => (
               <button key={key} onClick={() => {setActiveTab(key); setMobileMenuOpen(false);}} className="block w-full text-left px-3 py-2 rounded-md hover:bg-indigo-600 text-white">
                  {key === 'home' ? 'หน้าแรก' : key === 'lessons' ? 'บทเรียน' : 'ผู้จัดทำ'}
               </button>
             ))}
             <button onClick={handleLogout} className="block w-full text-left px-3 py-2 rounded-md bg-red-600 mt-2 text-white hover:bg-red-700">ออกจากระบบ</button>
          </div>
        )}
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'home' && <HomePage changeTab={setActiveTab} progress={progressPercent} totalLessons={lessons.length} totalScore={totalScore} maxScore={maxScore} />}
        {activeTab === 'lessons' && <LessonsPage lessons={lessons} userRole={user.role} onUpdateLesson={handleUpdateLesson} quizResults={quizResults} setQuizResults={setQuizResults} />}
        {activeTab === 'about' && <AboutPage />}
      </main>
    </div>
  );
};

// --- Sub-Components ---

const HomePage = ({ changeTab, progress, totalLessons, totalScore, maxScore }) => (
  <div className="space-y-8 animate-fade-in">
    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:opacity-10 transition duration-700"></div>
      <div className="relative z-10">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">ยินดีต้อนรับสู่ Equation Learning Media</h1>
        <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-2xl">แพลตฟอร์มการเรียนรู้อสมการแบบครบวงจร พร้อมแบบทดสอบเก็บคะแนนจริง</p>
        <button onClick={() => changeTab('lessons')} className="bg-yellow-400 text-blue-900 font-bold py-3 px-8 rounded-full shadow-lg hover:bg-yellow-300 flex items-center gap-2 transition transform hover:-translate-y-1">
          <PlayCircle size={20} /> เริ่มเรียนบทที่ 1
        </button>
      </div>
    </div>
    
    <div className="grid md:grid-cols-3 gap-6">
       <div className="bg-white p-6 rounded-xl shadow border-l-4 border-green-500 hover:shadow-lg transition">
         <div className="flex justify-between items-center mb-2"><span className="text-gray-500 text-sm font-bold">ความคืบหน้า</span><BarChart2 className="text-green-500" size={24}/></div>
         <p className="text-4xl font-bold text-gray-800">{progress}%</p>
         <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2"><div className="bg-green-500 h-2.5 rounded-full transition-all duration-1000" style={{ width: `${progress}%` }}></div></div>
       </div>
       <div className="bg-white p-6 rounded-xl shadow border-l-4 border-yellow-500 hover:shadow-lg transition">
         <div className="flex justify-between items-center mb-2"><span className="text-gray-500 text-sm font-bold">คะแนนรวม</span><Award className="text-yellow-500" size={24}/></div>
         <p className="text-4xl font-bold text-gray-800">{totalScore} <span className="text-xl text-gray-400">/ {maxScore}</span></p>
       </div>
       <div className="bg-white p-6 rounded-xl shadow border-l-4 border-blue-500 hover:shadow-lg transition">
         <div className="flex justify-between items-center mb-2"><span className="text-gray-500 text-sm font-bold">บทเรียนทั้งหมด</span><BookOpen className="text-blue-500" size={24}/></div>
         <p className="text-4xl font-bold text-gray-800">{totalLessons} <span className="text-xl text-gray-400">บท</span></p>
       </div>
    </div>
  </div>
);

const LessonsPage = ({ lessons, userRole, onUpdateLesson, quizResults, setQuizResults }) => {
  const [activeLessonId, setActiveLessonId] = useState(null);
  const [mode, setMode] = useState('study'); 
  const [isEditing, setIsEditing] = useState(false);
  // เพิ่ม State สำหรับ quiz ใน editForm
  const [editForm, setEditForm] = useState({ title: '', content: '', quiz: [] });

  const activeLesson = lessons.find(l => l.id === activeLessonId);

  useEffect(() => {
    if (activeLesson && isEditing) {
      // โหลดข้อมูลเดิมลง Form รวมถึง Quiz ด้วย
      setEditForm({ 
        title: activeLesson.title, 
        content: activeLesson.content,
        quiz: activeLesson.quiz || [] 
      });
    }
  }, [isEditing, activeLesson]);

  const handleSave = () => {
    onUpdateLesson(activeLessonId, editForm);
    setIsEditing(false);
  };

  const handleQuizUpdate = (qIndex, field, value, oIndex = null) => {
    const newQuiz = [...editForm.quiz];
    if (field === 'q') newQuiz[qIndex].q = value;
    if (field === 'ans') newQuiz[qIndex].ans = parseInt(value);
    if (field === 'option' && oIndex !== null) newQuiz[qIndex].options[oIndex] = value;
    setEditForm({ ...editForm, quiz: newQuiz });
  };

  const handleQuizComplete = (score) => {
    setQuizResults(prev => ({ ...prev, [activeLessonId]: Math.max(prev[activeLessonId] || 0, score) }));
  };

  if (!activeLessonId) {
    return (
      <div className="animate-fade-in">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <BookOpen className="text-indigo-600"/> เลือกบทเรียน
        </h2>
        {lessons.length === 0 ? (
           <div className="text-center py-20 bg-white rounded-xl shadow border border-dashed border-gray-300">
             <p className="text-gray-400 text-lg">ยังไม่มีบทเรียนในระบบ</p>
             {userRole === 'admin' && <p className="text-red-500 text-sm mt-2">กรุณากดปุ่ม Seed Data มุมขวาล่าง</p>}
           </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lessons.map((lesson) => (
              <div key={lesson.id} onClick={() => { setActiveLessonId(lesson.id); setMode('study'); setIsEditing(false); window.scrollTo(0,0); }} 
                   className="bg-white rounded-xl shadow hover:shadow-xl cursor-pointer transition duration-300 border border-transparent hover:border-indigo-300 p-6 group flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                   <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-2 py-1 rounded border border-indigo-100">บทที่ {lesson.id}</span>
                   {quizResults[lesson.id] !== undefined ? 
                     <span className="flex items-center text-green-600 text-xs font-bold bg-green-50 px-2 py-1 rounded"><CheckCircle size={14} className="mr-1"/> {quizResults[lesson.id]}/3</span> : 
                     <span className="flex items-center text-gray-400 text-xs bg-gray-50 px-2 py-1 rounded"><Lock size={14} className="mr-1"/> รอเรียน</span>
                   }
                </div>
                <h3 className="font-bold text-lg mb-2 group-hover:text-indigo-600 transition line-clamp-2">{lesson.title}</h3>
                <p className="text-gray-500 text-sm line-clamp-2 mb-4 flex-grow">{lesson.summary}</p>
                <div className="pt-4 border-t border-gray-100 flex items-center text-indigo-600 font-medium text-sm group-hover:translate-x-1 transition-transform">
                  เข้าสู่บทเรียน <ArrowRight size={16} className="ml-1"/>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      <button onClick={() => setActiveLessonId(null)} className="flex items-center text-gray-500 hover:text-indigo-600 mb-6 bg-white px-4 py-2 rounded-full shadow-sm hover:shadow transition">
        <ChevronLeft size={20} /> กลับหน้ารวม
      </button>

      <div className="bg-white rounded-xl shadow-lg p-6 md:p-10 min-h-[600px]">
        {/* Admin Edit Controls */}
        {userRole === 'admin' && mode === 'study' && (
          <div className="flex justify-end mb-6 border-b pb-4">
            {!isEditing ? (
              <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 bg-yellow-100 text-yellow-700 px-4 py-2 rounded-lg hover:bg-yellow-200 font-bold transition">
                <Edit size={16} /> แก้ไขบทเรียน
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={() => setIsEditing(false)} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition">ยกเลิก</button>
                <button onClick={handleSave} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 shadow transition">
                  <Save size={16} /> บันทึก
                </button>
              </div>
            )}
          </div>
        )}

        {isEditing ? (
          <div className="space-y-8 animate-fade-in">
            {/* ส่วนแก้ไขเนื้อหา */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
              <h3 className="text-lg font-bold mb-4 text-indigo-700 flex items-center gap-2"><BookOpen size={20}/> เนื้อหาบทเรียน</h3>
              <div className="space-y-4">
                <div>
                  <label className="font-bold block mb-2 text-sm">ชื่อบทเรียน</label>
                  <input className="w-full border p-2 rounded focus:ring-2 focus:ring-indigo-500 outline-none" value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} />
                </div>
                <div>
                  <label className="font-bold block mb-2 text-sm">เนื้อหา (Text)</label>
                  <textarea className="w-full border p-2 rounded h-64 focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-sm" value={editForm.content} onChange={e => setEditForm({...editForm, content: e.target.value})} />
                </div>
              </div>
            </div>

            {/* ส่วนแก้ไขแบบทดสอบ */}
            <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
              <h3 className="text-lg font-bold mb-4 text-blue-700 flex items-center gap-2"><Calculator size={20}/> แก้ไขแบบทดสอบ (3 ข้อ)</h3>
              <div className="space-y-6">
                {editForm.quiz.map((q, qIndex) => (
                  <div key={qIndex} className="bg-white p-4 rounded-lg shadow-sm border border-blue-100">
                    <div className="mb-3">
                      <label className="block text-sm font-bold mb-1 text-gray-700">คำถามข้อที่ {qIndex + 1}</label>
                      <input 
                        className="w-full border p-2 rounded bg-gray-50 focus:bg-white transition"
                        value={q.q}
                        onChange={(e) => handleQuizUpdate(qIndex, 'q', e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                      {q.options.map((opt, oIndex) => (
                        <div key={oIndex} className="relative">
                          <input 
                            className={`w-full border p-2 rounded pr-8 ${q.ans === oIndex ? 'border-green-500 bg-green-50 ring-1 ring-green-500' : ''}`}
                            value={opt}
                            onChange={(e) => handleQuizUpdate(qIndex, 'option', e.target.value, oIndex)}
                            placeholder={`ตัวเลือก ${oIndex + 1}`}
                          />
                          {q.ans === oIndex && <CheckCircle size={16} className="absolute right-2 top-3 text-green-600"/>}
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 bg-gray-100 p-2 rounded">
                       <label className="text-sm font-bold text-gray-600">เฉลย (เลือกข้อที่ถูก):</label>
                       <select 
                          value={q.ans}
                          onChange={(e) => handleQuizUpdate(qIndex, 'ans', e.target.value)}
                          className="border p-1 rounded text-sm bg-white"
                       >
                          {q.options.map((_, idx) => <option key={idx} value={idx}>ตัวเลือกที่ {idx + 1}</option>)}
                       </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-8 border-b pb-4">
               <span className="text-indigo-600 font-bold bg-indigo-50 px-3 py-1 rounded-full text-sm">บทที่ {activeLesson.id}</span>
               <h2 className="text-3xl font-bold mt-2 text-gray-800">{activeLesson.title}</h2>
            </div>
            
            {mode === 'study' ? (
              <div className="animate-fade-in">
                <div className="prose max-w-none text-gray-700 text-lg leading-loose whitespace-pre-wrap font-sans">
                  {activeLesson.content}
                </div>
                
                <div className="mt-16 text-center bg-indigo-50 p-8 rounded-2xl border border-indigo-100">
                  <h3 className="font-bold text-indigo-900 mb-2 text-xl">เข้าใจเนื้อหาแล้วใช่ไหม?</h3>
                  <p className="text-indigo-600 mb-6">ทดสอบความรู้ของคุณเพื่อเก็บคะแนนสะสม</p>
                  <button onClick={() => setMode('quiz')} className="bg-indigo-600 text-white px-10 py-4 rounded-full hover:bg-indigo-700 shadow-lg font-bold inline-flex items-center gap-2 transition transform hover:-translate-y-1">
                    <Calculator size={24} /> เริ่มทำแบบทดสอบ
                  </button>
                </div>
              </div>
            ) : (
              <QuizComponent lesson={activeLesson} onComplete={handleQuizComplete} onBack={() => setMode('study')} />
            )}
          </>
        )}
      </div>
    </div>
  );
};

const QuizComponent = ({ lesson, onComplete, onBack }) => {
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [finished, setFinished] = useState(false);

  const handleAnswer = (idx) => {
    if (selected !== null) return;
    setSelected(idx);
    if (idx === lesson.quiz[currentQ].ans) setScore(s => s + 1);
  };

  const nextQ = () => {
    if (currentQ < lesson.quiz.length - 1) {
      setCurrentQ(c => c + 1);
      setSelected(null);
    } else {
      setFinished(true);
      onComplete(score + (selected === lesson.quiz[currentQ].ans ? 1 : 0) - score);
    }
  };

  if (finished) {
    return (
      <div className="text-center py-16 animate-fade-in">
        <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
          <Award size={48} className="text-yellow-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-800">สรุปคะแนนบทที่ {lesson.id}</h3>
        <p className="text-6xl font-extrabold text-indigo-600 my-6">{score} <span className="text-3xl text-gray-300">/ {lesson.quiz.length}</span></p>
        <div className="flex justify-center gap-4">
          <button onClick={onBack} className="bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-bold hover:bg-gray-300 transition">ทบทวนบทเรียน</button>
          <button onClick={() => onBack()} className="bg-gray-800 text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-900 transition">กลับหน้ารวม</button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
      <div className="flex justify-between mb-8">
        <div>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">คำถามข้อที่</span>
          <h3 className="text-3xl font-bold text-indigo-600">{currentQ + 1}<span className="text-gray-300 text-xl">/{lesson.quiz.length}</span></h3>
        </div>
        <div className="text-right">
           <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">คะแนนสะสม</span>
           <div className="text-xl font-bold text-gray-800">{score}</div>
        </div>
      </div>
      
      <h3 className="text-xl font-bold mb-8 text-gray-800 leading-normal">{lesson.quiz[currentQ].q}</h3>
      
      <div className="space-y-4">
        {lesson.quiz[currentQ].options.map((opt, idx) => {
          const isSelected = selected === idx;
          const isCorrect = idx === lesson.quiz[currentQ].ans;
          
          let btnClass = "w-full p-5 text-left border-2 rounded-xl transition font-medium text-lg relative ";
          if (selected === null) {
            btnClass += "border-gray-100 hover:border-indigo-500 hover:bg-indigo-50 text-gray-600";
          } else {
            if (isCorrect) btnClass += "bg-green-100 border-green-500 text-green-800";
            else if (isSelected) btnClass += "bg-red-100 border-red-500 text-red-800";
            else btnClass += "border-gray-100 text-gray-400 opacity-50";
          }

          return (
            <button key={idx} onClick={() => handleAnswer(idx)} disabled={selected !== null} className={btnClass}>
              <div className="flex justify-between items-center">
                {opt}
                {selected !== null && isCorrect && <CheckCircle size={24} className="text-green-600"/>}
                {selected !== null && isSelected && !isCorrect && <XCircle size={24} className="text-red-600"/>}
              </div>
            </button>
          );
        })}
      </div>
      
      {selected !== null && (
        <div className="mt-8 flex justify-end animate-fade-in">
          <button onClick={nextQ} className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 shadow-lg inline-flex items-center gap-2 transition transform hover:-translate-y-1">
            {currentQ < lesson.quiz.length - 1 ? 'ข้อถัดไป' : 'ส่งคำตอบ'} <ArrowRight size={20}/>
          </button>
        </div>
      )}
    </div>
  );
};

const AboutPage = () => (
  <div className="max-w-4xl mx-auto bg-white p-10 rounded-xl shadow-md text-center animate-fade-in">
    <h2 className="text-3xl font-bold text-gray-800 mb-4">ผู้จัดทำโครงงาน</h2>
    <p className="text-indigo-600 font-medium mb-10 text-lg">วิทยาลัยเทคนิคตรัง (Trang Technical College)</p>
    <div className="grid md:grid-cols-2 gap-8">
      <div className="p-8 border rounded-2xl hover:shadow-lg transition group">
        <div className="w-24 h-24 bg-pink-100 rounded-full mx-auto mb-6 flex items-center justify-center text-pink-500 group-hover:scale-110 transition duration-300"><Users size={40}/></div>
        <h3 className="font-bold text-xl text-gray-800">นางสาวลลิตภัทร รักษ์แก้ว</h3>
        <p className="text-gray-500 mt-2">รหัสนักศึกษา: 67319100015</p>
        <p className="text-gray-400 text-sm mt-1">ปวส. 2/1 เทคโนโลยีธุรกิจดิจิทัล</p>
      </div>
      <div className="p-8 border rounded-2xl hover:shadow-lg transition group">
        <div className="w-24 h-24 bg-blue-100 rounded-full mx-auto mb-6 flex items-center justify-center text-blue-500 group-hover:scale-110 transition duration-300"><Users size={40}/></div>
        <h3 className="font-bold text-xl text-gray-800">นายอนิวรรตน์ ยี่เส้ง</h3>
        <p className="text-gray-500 mt-2">รหัสนักศึกษา: 67319100022</p>
        <p className="text-gray-400 text-sm mt-1">ปวส. 2/1 เทคโนโลยีธุรกิจดิจิทัล</p>
      </div>
    </div>
  </div>
);

import { BarChart2 } from 'lucide-react';

export default App;