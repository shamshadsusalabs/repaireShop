import { useEffect } from 'react';
import { Card, Table, Button, Divider, App, Spin } from 'antd';
import { PrinterOutlined, DownloadOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import useJobStore from '../store/jobStore';
import useMechanicStore from '../store/mechanicStore';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function Invoice() {
    const { message } = App.useApp();
    const { jobId } = useParams<{ jobId: string }>();
    const { currentJob: job, loading: jobLoading, fetchJobById } = useJobStore();
    const { mechanics, fetchMechanics } = useMechanicStore();
    const navigate = useNavigate();

    useEffect(() => {
        if (jobId) fetchJobById(jobId);
        fetchMechanics();
    }, [jobId, fetchJobById, fetchMechanics]);

    const handleDownloadPDF = async () => {
        const element = document.getElementById('invoice-content');
        if (!element) return;

        try {
            message.loading({ content: 'Generating PDF...', key: 'pdf-gen' });

            // Wait for images to load if needed, but usually scale: 2 handles quality
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff', // Ensure white background
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
            });

            const imgWidth = 210; // A4 width
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            // If content is taller than one page, we might need multiple pages (basic implementation handles single page well)
            // For now, simple addImage fits most invoices
            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

            pdf.save(`Invoice_${job?.jobId || 'SusaLabs'}.pdf`);
            message.success({ content: 'PDF downloaded!', key: 'pdf-gen' });
        } catch (error) {
            console.error('PDF Gen Error:', error);
            message.error({ content: 'Failed to generate PDF', key: 'pdf-gen' });
        }
    };

    if (jobLoading || !job) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <Spin size="large" />
            </div>
        );
    }

    const mechanic = job.mechanicId ? mechanics.find(m => m.id === job.mechanicId) : null;

    const partTotal = job.faultyParts.reduce((s, f) => s + f.actualCost, 0);
    const labourTotal = job.faultyParts.reduce((s, f) => s + f.labourCharge, 0);
    const discountTotal = job.faultyParts.reduce((s, f) => s + f.discount, 0);
    const subtotal = partTotal + labourTotal - discountTotal;
    const gst = Math.round(subtotal * 0.18);
    const grandTotal = subtotal + gst;

    const columns = [
        {
            title: '#',
            key: 'index',
            width: 40,
            render: (_: unknown, __: unknown, index: number) => index + 1,
        },
        {
            title: 'Description',
            key: 'desc',
            render: (_: unknown, record: { partName: string; issueDescription: string }) => (
                <div>
                    <div style={{ fontWeight: 700 }}>{record.partName}</div>
                    <div style={{ fontSize: 12, color: '#94a3b8' }}>{record.issueDescription}</div>
                </div>
            ),
        },
        {
            title: 'Part Cost',
            dataIndex: 'actualCost',
            key: 'actualCost',
            width: 110,
            render: (v: number) => `₹ ${v.toLocaleString()}`,
        },
        {
            title: 'Labour',
            dataIndex: 'labourCharge',
            key: 'labourCharge',
            width: 100,
            render: (v: number) => `₹ ${v.toLocaleString()}`,
        },
        {
            title: 'Discount',
            dataIndex: 'discount',
            key: 'discount',
            width: 100,
            render: (v: number) => v > 0 ? <span style={{ color: '#10b981' }}>-₹ {v.toLocaleString()}</span> : '—',
        },
        {
            title: 'Total',
            key: 'lineTotal',
            width: 120,
            render: (_: unknown, record: { actualCost: number; labourCharge: number; discount: number }) => {
                const total = record.actualCost + record.labourCharge - record.discount;
                return <span style={{ fontWeight: 700 }}>₹ {total.toLocaleString()}</span>;
            },
        },
    ];

    return (
        <div className="fade-in-up">
            <div className="no-print">
                <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate(`/job/${jobId}`)} style={{ fontWeight: 600, marginBottom: 8 }}>Back to Job</Button>

                <div className="page-header">
                    <h1>Invoice</h1>
                    <p>Generated invoice for <strong>{jobId}</strong></p>
                </div>
            </div>

            <Card id="invoice-content" className="invoice-container" style={{ maxWidth: 900, margin: '0 auto', cursor: 'default' }}>
                {/* Invoice Header */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    padding: '24px 28px',
                    background: 'linear-gradient(135deg, #1e1b4b 0%, #3730a3 100%)',
                    borderRadius: 14,
                    color: '#fff',
                    marginBottom: 28,
                }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                            <img src="/logo.jpeg" alt="SusaLabs" style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover' }} />
                            <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#fff' }}>SusaLabs</h2>
                        </div>
                        <div style={{ opacity: 0.8, fontSize: 13, lineHeight: 1.8 }}>
                            123, Workshop Lane, Industrial Area<br />
                            New Delhi – 110001<br />
                            Phone: +91 98765 43210<br />
                            GST: 07AAAFN1234A1ZY
                        </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>INVOICE</div>
                        <div style={{ opacity: 0.8, fontSize: 13 }}>
                            Invoice #: {job.jobId}<br />
                            Date: {job.date}
                        </div>
                    </div>
                </div>

                {/* Customer & Car Info */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 24,
                    marginBottom: 28,
                }}>
                    <div style={{
                        padding: '16px 20px',
                        background: '#f8fafc',
                        borderRadius: 12,
                        border: '1px solid #e2e8f0',
                    }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Bill To</div>
                        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{job.customerName}</div>
                        <div style={{ color: '#64748b', fontSize: 13 }}>Mobile: +91 {job.mobile}</div>
                    </div>
                    <div style={{
                        padding: '16px 20px',
                        background: '#f8fafc',
                        borderRadius: 12,
                        border: '1px solid #e2e8f0',
                    }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Vehicle Details</div>
                        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{job.carModel}</div>
                        <div style={{ color: '#64748b', fontSize: 13 }}>
                            Reg: {job.carNumber} • KM: {job.kmDriven.toLocaleString()}
                        </div>
                        {mechanic && (
                            <div style={{ color: '#64748b', fontSize: 13, marginTop: 2 }}>
                                Mechanic: {mechanic.name}
                            </div>
                        )}
                    </div>
                </div>

                {/* Parts & Labour Table */}
                <Table
                    dataSource={job.faultyParts}
                    columns={columns}
                    rowKey="partName"
                    pagination={false}
                    size="small"
                />

                <Divider />

                {/* Total Section */}
                <div style={{ maxWidth: 350, marginLeft: 'auto' }}>
                    {[
                        { label: 'Parts Total', value: partTotal },
                        { label: 'Labour Total', value: labourTotal },
                        { label: 'Discount', value: -discountTotal, color: '#10b981' },
                        { label: 'Subtotal', value: subtotal, bold: true },
                        { label: `GST (${job.gstPercent || 18}%)`, value: gst },
                    ].map(item => (
                        <div key={item.label} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            padding: '6px 0',
                            fontWeight: item.bold ? 700 : 400,
                            fontSize: item.bold ? 15 : 13,
                            color: item.color || '#475569',
                        }}>
                            <span>{item.label}</span>
                            <span>{item.value < 0 ? '-' : ''}₹ {Math.abs(item.value).toLocaleString()}</span>
                        </div>
                    ))}

                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '14px 16px',
                        marginTop: 12,
                        background: 'linear-gradient(135deg, #1e1b4b 0%, #3730a3 100%)',
                        borderRadius: 12,
                        color: '#fff',
                    }}>
                        <span style={{ fontSize: 18, fontWeight: 700 }}>Grand Total</span>
                        <span style={{ fontSize: 24, fontWeight: 800 }}>₹ {grandTotal.toLocaleString()}</span>
                    </div>
                </div>

                {/* Footer */}
                <div style={{
                    marginTop: 32,
                    padding: '20px',
                    background: '#f8fafc',
                    borderRadius: 12,
                    textAlign: 'center',
                    border: '1px solid #e2e8f0',
                }}>
                    <div style={{ fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>Thank you for choosing SusaLabs!</div>
                    <div style={{ fontSize: 12, color: '#94a3b8' }}>
                        Warranty: 30 days on parts replaced • Terms & conditions apply
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="no-print" data-html2canvas-ignore="true" style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                    <Button
                        type="primary"
                        icon={<PrinterOutlined />}
                        size="large"
                        onClick={() => window.print()}
                        style={{ flex: 1, height: 50 }}
                    >
                        Print Invoice
                    </Button>
                    <Button
                        icon={<DownloadOutlined />}
                        size="large"
                        onClick={handleDownloadPDF}
                        style={{ flex: 1, height: 50 }}
                    >
                        Download PDF
                    </Button>
                </div>
            </Card>
        </div>
    );
}
