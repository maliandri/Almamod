import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

// --- Datos para la Calculadora (sin cambios) ---
const moduleSizes = [
  { value: '15', label: 'Módulo 15 m²', baseCost: 15000 },
  { value: '30', label: 'Módulo 30 m²', baseCost: 28000 },
  { value: '45', label: 'Módulo 45 m²', baseCost: 40000 },
];
const roomOptions = {
  '15': [{ value: '1', label: '1 Ambiente' }, { value: '2', label: '2 Ambientes' }],
  '30': [{ value: '2', label: '2 Ambientes' }, { value: '3', label: '3 Ambientes' }],
  '45': [{ value: '3', label: '3 Ambientes' }, { value: '4', label: '4 Ambientes' }],
};
const floorTypes = [
  { value: 'vinilico', label: 'Piso Vinílico', multiplier: 1.0 },
  { value: 'flotante', label: 'Piso Flotante', multiplier: 1.1 },
  { value: 'porcelanato', label: 'Porcelanato', multiplier: 1.25 },
];
const bathroomTiers = [
    { value: 'basico', label: 'Baño Básico', cost: 2500 },
    { value: 'medium', label: 'Baño Medium', cost: 4000 },
    { value: 'premium', label: 'Baño Premium', cost: 6000 },
];
const kitchenTiers = [
    { value: 'basica', label: 'Cocina Básica', cost: 3000 },
    { value: 'medium', label: 'Cocina Medium', cost: 5500 },
    { value: 'premium', label: 'Cocina Premium', cost: 8000 },
];
const ModuleIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
);
const COST_PER_KM = 5;

function CalculadoraModulo() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    size: '', roomCount: '', floor: '',
    hasBathroom: false, bathroomQuality: '',
    hasKitchen: false, kitchenQuality: '',
    needsTransport: false, transportDistance: 0,
  });
  const [results, setResults] = useState(null);

  // --- Lógica del componente (sin cambios) ---
  const handleInputChange = (field, value) => setFormData(p => ({ ...p, [field]: value }));
  const handleCheckboxChange = (field, checked) => setFormData(p => ({ ...p, [field]: checked }));
  const calculateModuleProject = () => {
    const sizeData = moduleSizes.find(s => s.value === formData.size);
    const floorData = floorTypes.find(f => f.value === formData.floor);
    let totalCost = sizeData.baseCost * floorData.multiplier;
    let includedInstallations = ['Instalación Eléctrica Básica'];
    if (formData.hasBathroom) {
        const bathroomData = bathroomTiers.find(b => b.value === formData.bathroomQuality);
        totalCost += bathroomData.cost;
        includedInstallations.push('Instalación Sanitaria (Agua/Desagüe)');
    }
    if (formData.hasKitchen) {
        const kitchenData = kitchenTiers.find(k => k.value === formData.kitchenQuality);
        totalCost += kitchenData.cost;
        if (!includedInstallations.includes('Instalación Sanitaria (Agua/Desagüe)')) {
            includedInstallations.push('Instalación Sanitaria (Agua/Desagüe)');
        }
    }
    if (formData.needsTransport && formData.transportDistance > 0) {
        totalCost += formData.transportDistance * COST_PER_KM;
    }
    setResults({ 
        totalCost: Math.round(totalCost),
        summary: { ...formData },
        installations: includedInstallations
    });
    setStep(5);
  };
  const resetCalculator = () => {
    setStep(1);
    setFormData({
        size: '', roomCount: '', floor: '',
        hasBathroom: false, bathroomQuality: '',
        hasKitchen: false, kitchenQuality: '',
        needsTransport: false, transportDistance: 0,
    });
    setResults(null);
  };
  const availableRooms = useMemo(() => formData.size ? roomOptions[formData.size] : [], [formData.size]);
  const isStep1Valid = formData.size && formData.floor;
  const isStep2Valid = formData.roomCount;
  const isStep3Valid = (!formData.hasBathroom || formData.bathroomQuality) && (!formData.hasKitchen || formData.kitchenQuality);
  const isStep4Valid = !formData.needsTransport || (formData.needsTransport && formData.transportDistance > 0);
  const goToNextStep = () => setStep(s => s + 1);

  return (
    <>
      <motion.button className="floating-button" onClick={() => setIsOpen(true)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <ModuleIcon />
        <span>Cotizar Módulo</span>
      </motion.button>

      {isOpen && createPortal(
        <AnimatePresence>
          <motion.div className="modal-overlay" onClick={() => setIsOpen(false)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="modal-content" onClick={(e) => e.stopPropagation()} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}>
              <div className="modal-header">
                <h2>Calculadora de Módulo</h2>
                <button onClick={() => setIsOpen(false)} className="close-button">&times;</button>
              </div>
              <div className="modal-body">
                
                {/* 👇 LOS PASOS 1 Y 2 ESTÁN RESTAURADOS (SIN LOS COMENTARIOS INCORRECTOS) */}
                {step === 1 && (
                  <motion.div className="calculator-step">
                    <h3>Paso 1: Elige la Base</h3>
                    <label>Tamaño del Módulo</label>
                    <select value={formData.size} onChange={(e) => handleInputChange('size', e.target.value)}>
                      <option value="">Selecciona un tamaño</option>
                      {moduleSizes.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    <label>Tipo de Piso</label>
                    <select value={formData.floor} onChange={(e) => handleInputChange('floor', e.target.value)}>
                      <option value="">Selecciona un tipo de piso</option>
                      {floorTypes.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    <button onClick={goToNextStep} disabled={!isStep1Valid} className="main-action-button">Siguiente →</button>
                  </motion.div>
                )}
                
                {step === 2 && (
                    <motion.div className="calculator-step">
                        <h3>Paso 2: Distribución y Equipamiento</h3>
                        <label>Cantidad de Ambientes</label>
                        <select value={formData.roomCount} onChange={(e) => handleInputChange('roomCount', e.target.value)} disabled={!formData.size}>
                            <option value="">Selecciona N° de ambientes</option>
                            {availableRooms.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                        <label className="checkbox-label">
                            <input type="checkbox" checked={formData.hasBathroom} onChange={(e) => handleCheckboxChange('hasBathroom', e.target.checked)} />
                            Incluir Baño
                        </label>
                        <label className="checkbox-label">
                            <input type="checkbox" checked={formData.hasKitchen} onChange={(e) => handleCheckboxChange('hasKitchen', e.target.checked)} />
                            Incluir Cocina
                        </label>
                        <div className="step-navigation">
                            <button onClick={() => setStep(1)} className="secondary-action-button">← Anterior</button>
                            <button onClick={goToNextStep} disabled={!isStep2Valid} className="main-action-button">Siguiente →</button>
                        </div>
                    </motion.div>
                )}
                
                {step === 3 && (
                    <motion.div className="calculator-step">
                        <h3>Paso 3: Calidad de Acabados</h3>
                        {formData.hasBathroom && (
                             <div>
                                <label>Calidad del Baño</label>
                                <select value={formData.bathroomQuality} onChange={(e) => handleInputChange('bathroomQuality', e.target.value)}>
                                    <option value="">Selecciona una calidad</option>
                                    {bathroomTiers.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                </select>
                             </div>
                        )}
                        {formData.hasKitchen && (
                            <div>
                                <label>Calidad de la Cocina</label>
                                <select value={formData.kitchenQuality} onChange={(e) => handleInputChange('kitchenQuality', e.target.value)}>
                                    <option value="">Selecciona una calidad</option>
                                    {kitchenTiers.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                </select>
                            </div>
                        )}
                        <div className="step-navigation">
                            <button onClick={() => setStep(2)} className="secondary-action-button">← Anterior</button>
                            <button onClick={goToNextStep} disabled={!isStep3Valid} className="main-action-button">Siguiente →</button>
                        </div>
                    </motion.div>
                )}

                {step === 4 && (
                    <motion.div className="calculator-step">
                        <h3>Paso 4: Transporte</h3>
                        <label className="checkbox-label">
                            <input type="checkbox" checked={formData.needsTransport} onChange={(e) => handleCheckboxChange('needsTransport', e.target.checked)} />
                            Necesito transporte e instalación
                        </label>
                        {formData.needsTransport && (
                            <div>
                                <label>Distancia en Kilómetros desde Neuquén Capital</label>
                                <input 
                                    type="number" 
                                    value={formData.transportDistance}
                                    onChange={(e) => handleInputChange('transportDistance', parseInt(e.target.value) || 0)}
                                    placeholder="Ej: 150"
                                    style={{ padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '1rem', width: '100%' }}
                                />
                            </div>
                        )}
                        <div className="step-navigation">
                            <button onClick={() => setStep(3)} className="secondary-action-button">← Anterior</button>
                            <button onClick={calculateModuleProject} disabled={!isStep4Valid} className="main-action-button">Calcular Cotización 🚀</button>
                        </div>
                    </motion.div>
                )}

                {step === 5 && results && (
                  <motion.div className="calculator-step results">
                    <h3>¡Cotización Lista!</h3>
                    <div className="final-price">${results.totalCost.toLocaleString('es-AR')} USD</div>
                    <div className="results-summary">
                        <h4>Resumen de tu Módulo:</h4>
                        <ul>
                            <li><b>Tamaño:</b> {moduleSizes.find(s => s.value === results.summary.size)?.label}</li>
                            <li><b>Ambientes:</b> {results.summary.roomCount}</li>
                            <li><b>Piso:</b> {floorTypes.find(f => f.value === results.summary.floor)?.label}</li>
                            {results.summary.hasBathroom && <li><b>Baño:</b> {bathroomTiers.find(b => b.value === results.summary.bathroomQuality)?.label}</li>}
                            {results.summary.hasKitchen && <li><b>Cocina:</b> {kitchenTiers.find(k => k.value === results.summary.kitchenQuality)?.label}</li>}
                            {results.summary.needsTransport && <li><b>Transporte:</b> {results.summary.transportDistance} km</li>}
                        </ul>
                        <h4>Instalaciones Incluidas:</h4>
                        <ul>
                            {results.installations.map((item, index) => <li key={index}>✅ {item}</li>)}
                        </ul>
                    </div>
                    <p className="disclaimer">Costo aproximado en dólares (USD). No incluye platea de hormigón.</p>
                    <div className="results-actions">
                      <button onClick={resetCalculator} className="secondary-action-button">🔄 Cotizar de Nuevo</button>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>,
        document.getElementById('modal-portal')
      )}
    </>
  );
}

export default CalculadoraModulo;