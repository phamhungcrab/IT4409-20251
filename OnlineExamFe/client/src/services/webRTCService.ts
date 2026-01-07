
export class WebRTCService {
  private localStream: MediaStream | null = null;
  private localStreamPromise: Promise<MediaStream | null> | null = null;

  async startLocalStream(video = true, audio = false) {
      if (this.localStream) return this.localStream;
      if (this.localStreamPromise) return this.localStreamPromise;

      try {
          this.localStreamPromise = navigator.mediaDevices.getUserMedia({ video, audio });
          const stream = await this.localStreamPromise;
          this.localStream = stream;
          return stream;
      } catch (e) {
          console.error('Camera access denied:', e);
          return null;
      }
  }

  stopLocalStream() {
      if (this.localStream) {
          this.localStream.getTracks().forEach(t => t.stop());
          this.localStream = null;
      }
      this.localStreamPromise = null;
  }

  // Stub to satisfy existing calls if any, but ideally remove caller
  init(callback: any, options: any) {
    console.log("WebRTC init (fake)");
  }

  closeAll() {
    this.stopLocalStream();
  }
}

export const webRTCService = new WebRTCService();
