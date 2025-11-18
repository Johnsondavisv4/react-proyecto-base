import { motion } from "framer-motion";
import { useState } from "react";

export default function Test() {
  const [isVisible, setIsVisible] = useState(true);

  return (
    <div style={{ padding: "40px", fontFamily: "Arial, sans-serif" }}>
      <h1>Aprendiendo Framer Motion</h1>

      {/* 1. Animación básica con initial y animate */}
      <motion.div
        initial={{ opacity: 0, x: -100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        style={{
          padding: "20px",
          margin: "20px 0",
          backgroundColor: "#4CAF50",
          color: "white",
          borderRadius: "8px",
        }}
      >
        <h3>1. Animación de entrada</h3>
        <p>Este elemento aparece desde la izquierda con fade-in</p>
      </motion.div>

      {/* 2. Hover y Tap - interacciones */}
      <motion.button
        whileHover={{ scale: 1.1, backgroundColor: "#FF6B6B" }}
        whileTap={{ scale: 0.95 }}
        style={{
          padding: "15px 30px",
          fontSize: "16px",
          backgroundColor: "#007BFF",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          margin: "20px 0",
        }}
      >
        2. Pásame el mouse y haz click
      </motion.button>

      {/* 3. Animación de entrada/salida condicional */}
      <div style={{ margin: "20px 0" }}>
        <button
          onClick={() => setIsVisible(!isVisible)}
          style={{
            padding: "10px 20px",
            marginBottom: "10px",
            cursor: "pointer",
          }}
        >
          3. Toggle elemento
        </button>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              padding: "20px",
              backgroundColor: "#FFA726",
              color: "white",
              borderRadius: "8px",
            }}
          >
            ¡Aparezco y desaparezco con animación!
          </motion.div>
        )}
      </div>

      {/* 4. Animación continua (loop) */}
      <motion.div
        animate={{
          y: [0, -20, 0],
          rotate: [0, 5, -5, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          padding: "20px",
          margin: "20px 0",
          backgroundColor: "#9C27B0",
          color: "white",
          borderRadius: "8px",
          display: "inline-block",
        }}
      >
        <h3>4. Animación infinita</h3>
        <p>Me muevo continuamente</p>
      </motion.div>

      {/* 5. Variants - animaciones organizadas */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{
          margin: "20px 0",
        }}
      >
        <h3>5. Animación en cascada (Variants)</h3>
        {[1, 2, 3].map((item) => (
          <motion.div
            key={item}
            variants={itemVariants}
            style={{
              padding: "15px",
              margin: "10px 0",
              backgroundColor: "#00BCD4",
              color: "white",
              borderRadius: "8px",
            }}
          >
            Item {item}
          </motion.div>
        ))}
      </motion.div>

      {/* 6. Drag - arrastrar elementos */}
      <motion.div
        drag
        dragConstraints={{ left: 0, right: 200, top: 0, bottom: 100 }}
        whileDrag={{ scale: 1.1, cursor: "grabbing" }}
        style={{
          padding: "20px",
          backgroundColor: "#E91E63",
          color: "white",
          borderRadius: "8px",
          cursor: "grab",
          display: "inline-block",
          margin: "20px 0",
        }}
      >
        <h3>6. ¡Arrástrame!</h3>
        <p>Drag dentro del área permitida</p>
      </motion.div>
    </div>
  );
}

// Variants para animación en cascada
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2, // Retraso entre cada hijo
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -50 },
  visible: { opacity: 1, x: 0 },
};
