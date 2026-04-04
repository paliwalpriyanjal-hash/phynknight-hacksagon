"""
Prediction service — rule-based mock with realistic outputs.
Replace with real ML model (scikit-learn / TensorFlow) for production.
"""

HIGH_RISK_SYMPTOMS = {
    'chest pain', 'shortness of breath', 'unconscious', 'stroke signs',
    'seizure', 'severe abdominal pain', 'not breathing', 'heart attack',
    'crushing pain', 'left arm pain', 'jaw pain', 'cyanosis', 'blue lips'
}
MEDIUM_RISK_SYMPTOMS = {
    'severe headache', 'high fever', 'bleeding', 'fracture',
    'allergic reaction', 'burns', 'dizziness', 'vomiting blood'
}
HIGH_RISK_KEYWORDS = [
    'chest pain', 'heart attack', 'unconscious', 'not breathing', 'stroke',
    'seizure', 'severe bleeding', 'crushing', 'radiating', 'left arm',
    'jaw pain', "can't breathe", 'difficulty breathing', 'blue lips'
]

FIRST_AID = {
    'HIGH': [
        'Call emergency services immediately',
        'Keep the patient calm and still',
        'Do not give food or water',
        'Loosen tight clothing around neck and chest',
        'Monitor breathing and pulse continuously',
        'If trained, prepare for CPR',
    ],
    'MEDIUM': [
        'Keep patient comfortable and calm',
        'Apply first aid for visible injuries',
        'Do not move patient if spinal injury suspected',
        'Keep patient warm and monitor vitals',
    ],
    'LOW': [
        'Rest and stay calm',
        'Stay hydrated',
        'Monitor symptoms for worsening',
        'Seek medical attention if symptoms worsen',
    ],
}

EXPLANATIONS = {
    'HIGH': 'Critical symptoms detected indicating possible life-threatening emergency. Immediate medical intervention required.',
    'MEDIUM': 'Moderate risk symptoms identified. Medical attention recommended promptly.',
    'LOW': 'Low-severity symptoms detected. Monitor closely and seek advice if condition changes.',
}

ACCIDENT_SEVERITY = {
    'severe': 'Major trauma detected. Immediate surgical intervention may be required.',
    'moderate': 'Moderate injuries detected. Medical evaluation needed.',
    'minor': 'Minor injuries detected. Basic first aid may be sufficient.',
}


def predict_from_symptoms(symptoms: list, description: str = '') -> dict:
    score = 0
    matched = []

    for s in symptoms:
        sl = s.lower()
        if sl in HIGH_RISK_SYMPTOMS:
            score += 35
            matched.append(s)
        elif sl in MEDIUM_RISK_SYMPTOMS:
            score += 20
            matched.append(s)
        else:
            score += 8

    # keyword scan on description
    desc_lower = description.lower()
    for kw in HIGH_RISK_KEYWORDS:
        if kw in desc_lower:
            score += 12

    if len(symptoms) >= 3:
        score += 10

    score = min(score, 100)
    risk = 'HIGH' if score >= 65 else ('MEDIUM' if score >= 35 else 'LOW')
    confidence = round(min(95, 55 + score * 0.4))

    return {
        'risk_level': risk,
        'confidence': confidence,
        'score': score,
        'extracted_symptoms': matched[:4],
        'first_aid': FIRST_AID[risk],
        'recommended_action': EXPLANATIONS[risk],
    }


def predict_from_voice(voice_text: str) -> dict:
    if not voice_text:
        return {'risk_level': 'LOW', 'confidence': 50, 'keywords_found': []}

    text = voice_text.lower()
    found = [kw for kw in HIGH_RISK_KEYWORDS if kw in text]
    score = min(100, len(found) * 18)
    risk = 'HIGH' if score >= 54 else ('MEDIUM' if score >= 30 else 'LOW')

    return {
        'risk_level': risk,
        'confidence': round(min(90, 50 + score * 0.4)),
        'keywords_found': found,
        'text_length': len(voice_text),
    }


def predict_from_image(filename: str) -> dict:
    """
    Mock image analysis. In production: load CNN model and run inference.
    Returns severity based on filename heuristics for demo purposes.
    """
    name = (filename or '').lower()
    if any(w in name for w in ['severe', 'critical', 'major', 'blood']):
        severity = 'severe'
        score = 80
    elif any(w in name for w in ['moderate', 'injury', 'accident']):
        severity = 'moderate'
        score = 50
    else:
        severity = 'minor'
        score = 20

    return {
        'accident_severity': severity,
        'severity_score': score,
        'description': ACCIDENT_SEVERITY[severity],
        'confidence': round(min(88, 55 + score * 0.35)),
    }


def fuse_predictions(symptoms_pred: dict, voice_pred: dict, image_pred: dict) -> dict:
    """Weighted fusion of all three prediction sources."""
    weights = {'symptoms': 0.5, 'voice': 0.3, 'image': 0.2}

    risk_scores = {'HIGH': 3, 'MEDIUM': 2, 'LOW': 1}
    score_to_risk = {3: 'HIGH', 2: 'MEDIUM', 1: 'LOW'}

    s_score = risk_scores.get(symptoms_pred.get('risk_level', 'LOW'), 1)
    v_score = risk_scores.get(voice_pred.get('risk_level', 'LOW'), 1)
    img_score = risk_scores.get(
        'HIGH' if image_pred.get('severity_score', 0) >= 70 else
        'MEDIUM' if image_pred.get('severity_score', 0) >= 40 else 'LOW', 1
    )

    fused = (s_score * weights['symptoms'] + v_score * weights['voice'] + img_score * weights['image'])
    final_risk = score_to_risk[round(fused)]

    avg_confidence = round(
        symptoms_pred.get('confidence', 60) * weights['symptoms'] +
        voice_pred.get('confidence', 50) * weights['voice'] +
        image_pred.get('confidence', 50) * weights['image']
    )

    return {
        'risk_level': final_risk,
        'confidence': avg_confidence,
        'first_aid': FIRST_AID[final_risk],
        'recommended_action': EXPLANATIONS[final_risk],
        'extracted_symptoms': symptoms_pred.get('extracted_symptoms', []),
        'accident_severity': image_pred.get('accident_severity', 'unknown'),
    }
