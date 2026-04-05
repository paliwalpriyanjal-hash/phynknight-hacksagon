from flask import Blueprint, request, jsonify
import os
from services.predictor import (
    predict_from_symptoms,
    predict_from_voice,
    predict_from_image,
    fuse_predictions,
)

predict_bp = Blueprint('predict', __name__)

UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


@predict_bp.route('/symptoms', methods=['POST'])
def symptoms():
    data = request.get_json(force=True)
    symptoms_list = data.get('symptoms', [])
    description = data.get('description', '')
    result = predict_from_symptoms(symptoms_list, description)
    return jsonify(result)


@predict_bp.route('/voice', methods=['POST'])
def voice():
    data = request.get_json(force=True)
    voice_text = data.get('voiceText', '') or data.get('voice_text', '')
    result = predict_from_voice(voice_text)
    return jsonify(result)


@predict_bp.route('/image', methods=['POST'])
def image():
    if 'image' in request.files:
        f = request.files['image']
        filepath = os.path.join(UPLOAD_FOLDER, f.filename)
        f.save(filepath)
        result = predict_from_image(f.filename)
    else:
        # JSON with filename
        data = request.get_json(force=True) or {}
        result = predict_from_image(data.get('filename', ''))
    return jsonify(result)


@predict_bp.route('/final', methods=['POST'])
def final():
    data = request.get_json(force=True)
    symptoms_pred = data.get('symptomsPrediction', {})
    voice_pred = data.get('voicePrediction', {})
    image_pred = data.get('imagePrediction', {})
    result = fuse_predictions(symptoms_pred, voice_pred, image_pred)
    return jsonify(result)
