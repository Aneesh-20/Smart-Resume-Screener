import os
import fitz  # PyMuPDF
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

RESUMES_DIR = os.path.join(os.path.dirname(__file__), "resumes")

def txt_to_pdf(txt_name: str, pdf_name: str):
    txt_path = os.path.join(RESUMES_DIR, txt_name)
    pdf_path = os.path.join(RESUMES_DIR, pdf_name)
    
    with open(txt_path, "r", encoding="utf-8") as f:
        lines = f.readlines()
        
    c = canvas.Canvas(pdf_path, pagesize=letter)
    width, height = letter
    y = height - 50
    
    c.setFont("Helvetica-Bold", 14)
    c.drawString(50, y, lines[0].strip())
    y -= 25
    c.setFont("Helvetica", 10)
    
    for line in lines[1:]:
        text = line.strip()
        if not text:
            y -= 10
            continue
        if text.isupper() or text.startswith("PROFESSIONAL") or text.startswith("CORE") or text.startswith("SKILLS") or text.startswith("EXPERIENCE") or text.startswith("EDUCATION") or text.startswith("CERTIFICATIONS"):
            y -= 10
            c.setFont("Helvetica-Bold", 11)
            c.drawString(50, y, text)
            c.setFont("Helvetica", 10)
            y -= 15
        else:
            # simple wrap
            if len(text) > 85:
                c.drawString(50, y, text[:85])
                y -= 12
                c.drawString(65, y, text[85:])
            else:
                c.drawString(50, y, text)
            y -= 14
            
        if y < 50:
            c.showPage()
            y = height - 50
            c.setFont("Helvetica", 10)
            
    c.save()
    print(f"Generated PDF: {pdf_path}")

def generate_scanned_image_pdf():
    """Generates a PDF containing only an image drawing without text layer to test OCR error detection."""
    pdf_path = os.path.join(RESUMES_DIR, "scanned_or_unsupported.pdf")
    doc = fitz.open()
    page = doc.new_page(width=595, height=842) # A4
    
    # Draw shapes representing an image without text layer
    pix = fitz.Pixmap(fitz.csRGB, fitz.IRect(0, 0, 400, 500), False)
    pix.clear_with(240)
    page.insert_image(fitz.Rect(50, 50, 450, 550), pixmap=pix)
    
    doc.save(pdf_path)
    doc.close()
    print(f"Generated Scanned/Empty text PDF: {pdf_path}")

if __name__ == "__main__":
    txt_to_pdf("strong_candidate_alice_chen.txt", "strong_candidate_alice_chen.pdf")
    txt_to_pdf("partial_candidate_bob_martinez.txt", "partial_candidate_bob_martinez.pdf")
    txt_to_pdf("weak_candidate_charlie_davis.txt", "weak_candidate_charlie_davis.pdf")
    generate_scanned_image_pdf()
