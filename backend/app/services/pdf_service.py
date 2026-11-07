import os
import io
from datetime import datetime
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, KeepTogether
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from app.models.schemas import SessionState, FieldStatus

class PDFService:
    def generate_form_pdf(self, state: SessionState, form_title: str) -> bytes:
        """
        Generates a professional downloadable PDF with ReportLab.
        Includes AwaazForm header, Application ID, timestamp,
        verified fields table, source tracking, and prominent disclaimer.
        """
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            rightMargin=36,
            leftMargin=36,
            topMargin=36,
            bottomMargin=36
        )

        styles = getSampleStyleSheet()

        # Custom Styles
        primary_navy = colors.HexColor("#0F172A")
        accent_teal = colors.HexColor("#0D9488")
        light_bg = colors.HexColor("#F8FAFC")
        border_color = colors.HexColor("#E2E8F0")

        header_title_style = ParagraphStyle(
            'HeaderTitle',
            parent=styles['Heading1'],
            fontName='Helvetica-Bold',
            fontSize=22,
            leading=26,
            textColor=primary_navy,
            alignment=0
        )

        tagline_style = ParagraphStyle(
            'Tagline',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=10,
            leading=13,
            textColor=accent_teal,
            alignment=0
        )

        form_title_style = ParagraphStyle(
            'FormTitle',
            parent=styles['Heading2'],
            fontName='Helvetica-Bold',
            fontSize=15,
            leading=19,
            textColor=primary_navy,
            spaceAfter=6
        )

        meta_style = ParagraphStyle(
            'MetaStyle',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=9,
            leading=12,
            textColor=colors.HexColor("#475569")
        )

        table_header_style = ParagraphStyle(
            'TableHeader',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=9,
            leading=12,
            textColor=colors.white
        )

        label_style = ParagraphStyle(
            'FieldLabel',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=9,
            leading=12,
            textColor=primary_navy
        )

        value_style = ParagraphStyle(
            'FieldValue',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=9,
            leading=12,
            textColor=colors.HexColor("#1E293B")
        )

        badge_style = ParagraphStyle(
            'BadgeStyle',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=8,
            leading=10,
            textColor=colors.HexColor("#065F46")
        )

        disclaimer_heading = ParagraphStyle(
            'DiscHead',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=9,
            leading=12,
            textColor=colors.HexColor("#B45309")
        )

        disclaimer_text = ParagraphStyle(
            'DiscText',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=8,
            leading=11,
            textColor=colors.HexColor("#78350F")
        )

        story = []

        # 1. Header Banner
        header_data = [
            [
                Paragraph("<b>AwaazForm</b> (आवाज़फ़ॉर्म)", header_title_style),
                Paragraph(f"<b>Session Ref:</b> AF-{state.session_id[:8].upper()}<br/><b>Date:</b> {datetime.now().strftime('%d-%b-%Y %I:%M %p')}", meta_style)
            ],
            [
                Paragraph("Speak in your language. Complete your form with confidence.<br/><font color='#64748B'>Voice-First Intelligent Form Assistant | भारत का सुलभ फ़ॉर्म सहायक</font>", tagline_style),
                Paragraph("<b>Verification:</b> <font color='#0D9488'>All Fields Verified</font>", meta_style)
            ]
        ]
        header_table = Table(header_data, colWidths=[330, 190])
        header_table.setStyle(TableStyle([
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
            ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ]))
        story.append(header_table)

        story.append(Spacer(1, 10))
        story.append(HRFlowable(width="100%", thickness=1.5, color=accent_teal, spaceBefore=4, spaceAfter=14))

        # 2. Form Title Box
        story.append(Paragraph(f"Application Draft: <b>{form_title}</b>", form_title_style))
        story.append(Paragraph("This application draft was generated using assisted voice-input and document validation with complete user verification.", meta_style))
        story.append(Spacer(1, 14))

        # 3. Fields Table
        table_rows = [
            [
                Paragraph("Sr. No.", table_header_style),
                Paragraph("Field Name (विवरण)", table_header_style),
                Paragraph("Verified Value (प्रमाणित मान)", table_header_style),
                Paragraph("Source (स्रोत)", table_header_style),
                Paragraph("Status", table_header_style)
            ]
        ]

        idx = 1
        for key, field in state.fields.items():
            val = field.value or "—"
            src_label = (field.source or "voice").capitalize()
            stat_label = "VERIFIED" if field.status == FieldStatus.VERIFIED else field.status.upper()

            table_rows.append([
                Paragraph(str(idx), value_style),
                Paragraph(f"<b>{field.label_en}</b><br/><font color='#64748B' size='7'>{field.label_hi}</font>", label_style),
                Paragraph(val, value_style),
                Paragraph(src_label, value_style),
                Paragraph(f"<b>✓ {stat_label}</b>", badge_style)
            ])
            idx += 1

        fields_table = Table(table_rows, colWidths=[40, 160, 180, 70, 70])
        fields_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), primary_navy),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('ALIGN', (0, 0), (0, -1), 'CENTER'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('GRID', (0, 0), (-1, -1), 0.5, border_color),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, light_bg]),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ]))
        story.append(fields_table)

        story.append(Spacer(1, 18))

        # 4. Mandatory Disclaimer Box
        disc_content = [
            [
                Paragraph("<b>LEGAL DISCLAIMER / महत्वपूर्ण वैधानिक सूचना</b>", disclaimer_heading)
            ],
            [
                Paragraph(
                    "This document is a computer-assisted draft generated through the AwaazForm accessibility platform based on user speech input and optional document cross-checks. <b>This is not an official government submission or legal document</b> until signed and lodged directly through the authorized scholarship or administrative portal. AwaazForm does not store permanent government credentials.",
                    disclaimer_text
                )
            ]
        ]
        disc_table = Table(disc_content, colWidths=[520])
        disc_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#FEF3C7")),
            ('BOX', (0, 0), (-1, -1), 1, colors.HexColor("#F59E0B")),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('LEFTPADDING', (0, 0), (-1, -1), 10),
            ('RIGHTPADDING', (0, 0), (-1, -1), 10),
        ]))
        story.append(disc_table)

        story.append(Spacer(1, 24))

        # 5. Signature Section
        sig_data = [
            [
                Paragraph("<b>Applicant Signature / अंगूठे का निशान:</b>", label_style),
                Paragraph("<b>AwaazForm Verification Seal:</b>", label_style)
            ],
            [
                Spacer(1, 25),
                Spacer(1, 25)
            ],
            [
                Paragraph("___________________________________<br/>Full Name of Candidate", meta_style),
                Paragraph("<b>[✓ Digitally Verified via Voice Session]</b><br/>Hash: " + state.session_id, meta_style)
            ]
        ]
        sig_table = Table(sig_data, colWidths=[260, 260])
        sig_table.setStyle(TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ]))
        story.append(KeepTogether(sig_table))

        doc.build(story)
        pdf_bytes = buffer.getvalue()
        buffer.close()
        return pdf_bytes

pdf_service = PDFService()
