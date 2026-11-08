
package com.brightloop.backend.service;

import com.brightloop.backend.model.Invoice;
import com.brightloop.backend.repository.InvoiceRepository;

import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.Rectangle;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;

@Service
public class InvoicePdfService {

    private final InvoiceRepository invoiceRepository;

    public InvoicePdfService(InvoiceRepository invoiceRepository) {
        this.invoiceRepository = invoiceRepository;
    }

    @Transactional(readOnly = true)
    public byte[] generateInvoicePdf(Long invoiceId) {

        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Invoice not found"
                ));

        ByteArrayOutputStream output =
                new ByteArrayOutputStream();

        Document document = new Document();

        try {
            PdfWriter.getInstance(document, output);

            document.open();

            Font titleFont = FontFactory.getFont(
                    FontFactory.HELVETICA_BOLD, 22
            );

            Font headingFont = FontFactory.getFont(
                    FontFactory.HELVETICA_BOLD, 12
            );

            Font normalFont = FontFactory.getFont(
                    FontFactory.HELVETICA, 10
            );

            Paragraph companyName =
                    new Paragraph("BRIGHTLOOP", titleFont);

            companyName.setAlignment(Element.ALIGN_CENTER);
            document.add(companyName);

            Paragraph subtitle =
                    new Paragraph("SUBSCRIPTION INVOICE", headingFont);

            subtitle.setAlignment(Element.ALIGN_CENTER);
            subtitle.setSpacingAfter(25);
            document.add(subtitle);

            document.add(new Paragraph(
                    "Invoice Number: " + invoice.getInvoiceNumber(),
                    normalFont
            ));

            document.add(new Paragraph(
                    "Customer: " + invoice.getCustomer().getName(),
                    normalFont
            ));

            document.add(new Paragraph(
                    "Invoice Date: " + invoice.getInvoiceDate(),
                    normalFont
            ));

            document.add(new Paragraph(
                    "Due Date: " + invoice.getDueDate(),
                    normalFont
            ));

            document.add(new Paragraph(
                    "Status: " + invoice.getStatus(),
                    normalFont
            ));

            document.add(new Paragraph(" "));

            PdfPTable table = new PdfPTable(2);
            table.setWidthPercentage(100);
            table.setSpacingBefore(15);

            addRow(table, "Description", "Details", true);

            addRow(
                    table,
                    "Subscription ID",
                    String.valueOf(invoice.getSubscription().getId()),
                    false
            );

            addRow(
                    table,
                    "Billing Period",
                    invoice.getBillingPeriodStart()
                            + " to "
                            + invoice.getBillingPeriodEnd(),
                    false
            );

            addRow(
                    table,
                    "Subtotal",
                    money(invoice.getSubtotal()),
                    false
            );

            addRow(
                    table,
                    "Discount",
                    money(invoice.getDiscountAmount()),
                    false
            );

            addRow(
                    table,
                    "Taxable Amount",
                    money(invoice.getTaxableAmount()),
                    false
            );

            addRow(
                    table,
                    "Tax",
                    money(invoice.getTaxAmount()),
                    false
            );

            addRow(
                    table,
                    "Total Amount",
                    money(invoice.getTotalAmount()),
                    true
            );

            addRow(
                    table,
                    "Amount Paid",
                    money(invoice.getAmountPaid()),
                    false
            );

            addRow(
                    table,
                    "Balance Due",
                    money(invoice.getBalanceDue()),
                    true
            );

            document.add(table);

            Paragraph footer = new Paragraph(
                    "Thank you for choosing Brightloop!",
                    normalFont
            );

            footer.setAlignment(Element.ALIGN_CENTER);
            footer.setSpacingBefore(30);

            document.add(footer);

        } catch (Exception e) {
            throw new IllegalStateException(
                    "Failed to generate invoice PDF", e
            );
        } finally {
            if (document.isOpen()) {
                document.close();
            }
        }

        return output.toByteArray();
    }

    private void addRow(
            PdfPTable table,
            String label,
            String value,
            boolean highlighted) {

        Font font = FontFactory.getFont(
                highlighted
                        ? FontFactory.HELVETICA_BOLD
                        : FontFactory.HELVETICA,
                10
        );

        PdfPCell labelCell =
                new PdfPCell(new Phrase(label, font));

        PdfPCell valueCell =
                new PdfPCell(new Phrase(value, font));

        labelCell.setPadding(9);
        valueCell.setPadding(9);

        if (highlighted) {
            Color background = new Color(235, 241, 250);

            labelCell.setBackgroundColor(background);
            valueCell.setBackgroundColor(background);
        }

        labelCell.setBorder(Rectangle.BOX);
        valueCell.setBorder(Rectangle.BOX);

        table.addCell(labelCell);
        table.addCell(valueCell);
    }

    private String money(BigDecimal amount) {
        return "INR " + amount.toPlainString();
    }
}
