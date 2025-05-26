from flask import Flask, jsonify, request
from flask_cors import CORS
import cv2
import numpy as np
import base64
import threading
import time
from datetime import datetime, timedelta

app = Flask(__name__)
CORS(app)  # Enable CORS for JSX frontend

class RetinaDetector:
    def __init__(self):
        # Load OpenCV face and eye cascade classifiers
        self.face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        self.eye_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_eye.xml')
        
        # Timer variables
        self.timer_active = False
        self.timer_start_time = None
        self.timer_duration = 300  # 5 minutes in seconds
        self.last_detection_time = datetime.now()
        self.detection_threshold = 2  # seconds without detection to start timer
        
        # Start monitoring thread
        self.monitoring_thread = threading.Thread(target=self._monitor_detection, daemon=True)
        self.monitoring_thread.start()
    
    def detect_eyes(self, image_data):
        """Detect eyes in the provided image"""
        try:
            # Decode base64 image
            image_bytes = base64.b64decode(image_data.split(',')[1])
            nparr = np.frombuffer(image_bytes, np.uint8)
            frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if frame is None:
                return False, "Invalid image data"
            
            # Convert to grayscale
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            
            # Detect faces
            faces = self.face_cascade.detectMultiScale(gray, 1.3, 5)
            
            eyes_detected = False
            
            for (x, y, w, h) in faces:
                roi_gray = gray[y:y+h, x:x+w]
                roi_color = frame[y:y+h, x:x+w]
                
                # Detect eyes within face region
                eyes = self.eye_cascade.detectMultiScale(roi_gray)
                
                if len(eyes) >= 2:  # At least 2 eyes detected
                    eyes_detected = True
                    self.last_detection_time = datetime.now()
                    
                    # Reset timer if eyes are detected
                    if self.timer_active:
                        self.timer_active = False
                        self.timer_start_time = None
                    
                    break
            
            return eyes_detected, "Eyes detected" if eyes_detected else "No eyes detected"
            
        except Exception as e:
            return False, f"Error processing image: {str(e)}"
    
    def _monitor_detection(self):
        """Background thread to monitor detection and manage timer"""
        while True:
            current_time = datetime.now()
            time_since_last_detection = (current_time - self.last_detection_time).total_seconds()
            
            # Start timer if no detection for threshold period and timer not already active
            if time_since_last_detection > self.detection_threshold and not self.timer_active:
                self.timer_active = True
                self.timer_start_time = current_time
                print(f"Timer started at {current_time}")
            
            time.sleep(1)  # Check every second
    
    def get_timer_status(self):
        """Get current timer status"""
        if not self.timer_active:
            return {
                "timer_active": False,
                "remaining_time": 0,
                "message": "Eyes detected - Timer inactive"
            }
        
        current_time = datetime.now()
        elapsed_time = (current_time - self.timer_start_time).total_seconds()
        remaining_time = max(0, self.timer_duration - elapsed_time)
        
        if remaining_time <= 0:
            # Timer expired
            return {
                "timer_active": True,
                "remaining_time": 0,
                "message": "Timer expired! Eyes closed for 5 minutes",
                "alert": True
            }
        
        return {
            "timer_active": True,
            "remaining_time": int(remaining_time),
            "message": f"Eyes closed - Timer active ({int(remaining_time)}s remaining)"
        }

# Initialize detector
detector = RetinaDetector()

@app.route('/api/detect', methods=['POST'])
def detect_retina():
    """Endpoint to detect retina/eyes in uploaded image"""
    try:
        data = request.get_json()
        
        if not data or 'image' not in data:
            return jsonify({
                'success': False,
                'message': 'No image data provided'
            }), 400
        
        eyes_detected, message = detector.detect_eyes(data['image'])
        timer_status = detector.get_timer_status()
        
        return jsonify({
            'success': True,
            'eyes_detected': eyes_detected,
            'message': message,
            'timer_status': timer_status
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Server error: {str(e)}'
        }), 500

@app.route('/api/status', methods=['GET'])
def get_status():
    """Endpoint to get current timer status"""
    try:
        timer_status = detector.get_timer_status()
        return jsonify({
            'success': True,
            'timer_status': timer_status
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Server error: {str(e)}'
        }), 500

@app.route('/api/reset', methods=['POST'])
def reset_timer():
    """Endpoint to manually reset timer"""
    try:
        detector.timer_active = False
        detector.timer_start_time = None
        detector.last_detection_time = datetime.now()
        
        return jsonify({
            'success': True,
            'message': 'Timer reset successfully'
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Server error: {str(e)}'
        }), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'message': 'Retina detection server is running'
    })

if __name__ == '__main__':
    print("Starting Retina Detection Server on port 8001...")
    print("Server endpoints:")
    print("- POST /api/detect - Detect eyes in image")
    print("- GET /api/status - Get timer status")
    print("- POST /api/reset - Reset timer")
    print("- GET /health - Health check")
    
    app.run(host='0.0.0.0', port=8001, debug=True)