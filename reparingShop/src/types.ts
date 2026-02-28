export type JobStatus =
    | 'Pending'
    | 'Assigned'
    | 'Inspection'
    | 'Approval'
    | 'Approved'
    | 'Rejected'
    | 'Parts Requested'
    | 'Repairing'
    | 'Completed';

export interface InspectionResult {
    partName: string;
    status: 'OK' | 'Not OK' | 'Pending';
    comment: string;
}

export interface FaultyPart {
    partName: string;
    issueDescription: string;
    estimatedCost: number;
    actualCost: number;
    labourCharge: number;
    discount: number;
}

export interface IssuedPart {
    _id?: string;
    partId: string;
    partName: string;
    partNumber: string;
    quantityIssued: number;
    unitPrice: number;
    issuedBy?: {
        _id: string;
        name: string;
        email: string;
    } | string;
    issuedAt: string;
}

export interface Job {
    jobId: string;
    customerName: string;
    mobile: string;
    carModel: string;
    carNumber: string;
    kmDriven: number;
    carImage?: string;
    jobType: 'Pickup' | 'Walk-in';
    location?: string;
    date: string;
    status: JobStatus;
    mechanicId?: string;
    driverId?: {
        _id: string;
        name: string;
        email: string;
        avatar: string;
    } | string | null;
    driverTask?: 'Pickup' | 'Drop' | null;
    inspectionResults: InspectionResult[];
    faultyParts: FaultyPart[];
    partsIssued?: IssuedPart[];
    approved?: boolean;
    gstPercent: number;
    grandTotal: number;
}

export interface Mechanic {
    id: string;
    name: string;
    experience: string;
    specialty: string;
    avatar: string;
    available: boolean;
}

export interface Driver {
    _id: string;
    name: string;
    email: string;
    avatar: string;
    isActive: boolean;
}

export interface InspectionItem {
    name: string;
    icon: string;
}
