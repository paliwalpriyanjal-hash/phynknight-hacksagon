"""
MediSync ML Service — Flask microservice
Provides AI-powered risk prediction for emergency triage.
Run: python app.py  (port 5002)
"""
from flask import Flask
from flask_cors import CORS
from routes.predict import predict_bp

app = Flask(__name__)
CORS(app)

app.register_blueprint(predict_bp, url_prefix='/predict')

@app.route('/health')
def health():
    return {'status': 'OK', 'service': 'MediSync ML Service', 'version': '1.0.0'}

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5002, debug=True)
