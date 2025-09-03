import { useState } from 'react';
import { toast } from 'sonner@2.0.3';
import { projects as projectsAPI } from '../utils/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { CalendarIcon, Save, X } from 'lucide-react';
import { Separator } from './ui/separator';
// Using basic date formatting instead of date-fns
const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

interface ProjectFormProps {
  onCancel: () => void;
  onSuccess?: () => void;
  project?: any;
}

export default function ProjectForm({ onCancel, onSuccess, project }: ProjectFormProps) {
  const [formData, setFormData] = useState({
    // Basic Information
    serialNo: project?.serialNo || '',
    nameOfWork: project?.nameOfWork || project?.name || '',
    fileNumber: project?.fileNumber || '',
    dateOfInitiation: project?.dateOfInitiation ? new Date(project.dateOfInitiation) : null,
    
    // Project Classification
    schemeType: project?.schemeType || '',
    projectType: project?.projectType || '',
    
    // Cost Estimates
    estimatedCostExclGST: project?.estimatedCostExclGST || '',
    estimatedCostInclGST: project?.estimatedCostInclGST || '',
    capexCostInclGST: project?.capexCostInclGST || '',
    opexCostInclGST: project?.opexCostInclGST || '',
    
    // Approval Information
    proposedBy: project?.proposedBy || '',
    recommendedBy: project?.recommendedBy || '',
    approvalAccordedBy: project?.approvalAccordedBy || '',
    approvalDate: project?.approvalDate ? new Date(project.approvalDate) : null,
    
    // Work Division
    subDivisionBeforeAAES: project?.subDivisionBeforeAAES || '',
    subDivisionAfterAAES: project?.subDivisionAfterAAES || '',
    
    // Procurement Details
    modeOfProcurement: project?.modeOfProcurement || '',
    methodOfProcurement: project?.methodOfProcurement || '',
    emdExemptionType: project?.emdExemptionType || '',

    // Legacy fields for backward compatibility
    name: project?.name || '',
    description: project?.description || '',
    priority: project?.priority || '',
    status: project?.status || 'Planning',
    startDate: project?.startDate ? new Date(project.startDate) : null,
    endDate: project?.endDate ? new Date(project.endDate) : null,
    budget: project?.budget || '',
    manager: project?.manager || '',
    category: project?.category || ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Basic validation for required fields
    if (!formData.serialNo || !formData.nameOfWork || !formData.projectType) {
      toast.error('Please fill in all required fields (S. No, Name of Work, Project Type)');
      setIsSubmitting(false);
      return;
    }

    try {
      const projectData = {
        // Basic Information
        serialNo: formData.serialNo,
        nameOfWork: formData.nameOfWork,
        fileNumber: formData.fileNumber,
        dateOfInitiation: formData.dateOfInitiation?.toISOString(),
        
        // Project Classification
        schemeType: formData.schemeType,
        projectType: formData.projectType,
        
        // Cost Estimates
        estimatedCostExclGST: formData.estimatedCostExclGST,
        estimatedCostInclGST: formData.estimatedCostInclGST,
        capexCostInclGST: formData.capexCostInclGST,
        opexCostInclGST: formData.opexCostInclGST,
        
        // Approval Information
        proposedBy: formData.proposedBy,
        recommendedBy: formData.recommendedBy,
        approvalAccordedBy: formData.approvalAccordedBy,
        approvalDate: formData.approvalDate?.toISOString(),
        
        // Work Division
        subDivisionBeforeAAES: formData.subDivisionBeforeAAES,
        subDivisionAfterAAES: formData.subDivisionAfterAAES,
        
        // Procurement Details
        modeOfProcurement: formData.modeOfProcurement,
        methodOfProcurement: formData.methodOfProcurement,
        emdExemptionType: formData.emdExemptionType,

        // Legacy fields for backward compatibility
        name: formData.nameOfWork || formData.name,
        description: formData.description,
        priority: formData.priority,
        status: formData.status,
        startDate: formData.startDate?.toISOString(),
        endDate: formData.endDate?.toISOString(),
        budget: formData.estimatedCostInclGST || formData.budget,
        manager: formData.proposedBy || formData.manager,
        category: formData.category,
        progress: project?.progress || 0
      };

      if (project?.id) {
        await projectsAPI.update(project.id, {
          name: projectData.name,
          description: projectData.description,
          status: projectData.status,
          priority: projectData.priority,
          start_date: projectData.startDate,
          end_date: projectData.endDate,
          budget: parseFloat(String(projectData.budget).replace(/[^0-9.-]+/g,"")) || 0,
          tags: projectData.category ? [projectData.category] : []
        });
        toast.success('Project updated successfully!');
      } else {
        await projectsAPI.create({
          name: projectData.name,
          description: projectData.description || 'No description provided',
          status: projectData.status || 'Planning',
          priority: projectData.priority || 'Medium',
          start_date: projectData.startDate || new Date().toISOString(),
          end_date: projectData.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          budget: parseFloat(String(projectData.budget).replace(/[^0-9.-]+/g,"")) || 0,
          tags: projectData.category ? [projectData.category] : []
        });
        toast.success('Project created successfully!');
      }
      
      onSuccess?.();
      onCancel();
    } catch (error: any) {
      console.error('Failed to save project:', error);
      toast.error(error.message || 'Failed to save project');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1>{project ? 'Edit Project' : 'Create New Project'}</h1>
        <p className="text-gray-600">Fill in the details to {project ? 'update' : 'create'} your project.</p>
      </div>

      <Card className="max-w-7xl">
        <CardHeader>
          <CardTitle>Comprehensive Project Information</CardTitle>
          <CardDescription>
            Enter all required details for project creation and approval tracking
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information Section */}
            <div>
              <h3 className="text-lg font-medium mb-4">Basic Information</h3>
              <Separator className="mb-4" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="serialNo">S. No *</Label>
                  <Input
                    id="serialNo"
                    value={formData.serialNo}
                    onChange={(e) => handleInputChange('serialNo', e.target.value)}
                    placeholder="Enter serial number"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="nameOfWork">Name of Work *</Label>
                  <Input
                    id="nameOfWork"
                    value={formData.nameOfWork}
                    onChange={(e) => handleInputChange('nameOfWork', e.target.value)}
                    placeholder="Enter name of work"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fileNumber">File Number</Label>
                  <Input
                    id="fileNumber"
                    value={formData.fileNumber}
                    onChange={(e) => handleInputChange('fileNumber', e.target.value)}
                    placeholder="Enter file number"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Date of Initiation of File</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.dateOfInitiation ? formatDate(formData.dateOfInitiation) : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.dateOfInitiation || undefined}
                        onSelect={(date) => handleInputChange('dateOfInitiation', date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>

            {/* Project Classification Section */}
            <div>
              <h3 className="text-lg font-medium mb-4">Project Classification</h3>
              <Separator className="mb-4" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="schemeType">Scheme Type</Label>
                  <Select value={formData.schemeType} onValueChange={(value) => handleInputChange('schemeType', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select scheme type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rhq-er">RHQ ER Scheme</SelectItem>
                      <SelectItem value="chq">CHQ Scheme</SelectItem>
                      <SelectItem value="rcs">RCS Scheme</SelectItem>
                      <SelectItem value="moca">MOCA Scheme</SelectItem>
                      <SelectItem value="other">Any Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="projectType">Project Type *</Label>
                  <Select value={formData.projectType} onValueChange={(value) => handleInputChange('projectType', value)} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select project type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="expenditure">Expenditure</SelectItem>
                      <SelectItem value="revenue">Revenue Generation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Cost Estimates Section */}
            <div>
              <h3 className="text-lg font-medium mb-4">Cost Estimates</h3>
              <Separator className="mb-4" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="estimatedCostExclGST">Ballpark Estimated Cost Excl. GST</Label>
                  <Input
                    id="estimatedCostExclGST"
                    value={formData.estimatedCostExclGST}
                    onChange={(e) => handleInputChange('estimatedCostExclGST', e.target.value)}
                    placeholder="e.g., ₹50,00,000"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estimatedCostInclGST">Ballpark Estimated Cost Incl. GST</Label>
                  <Input
                    id="estimatedCostInclGST"
                    value={formData.estimatedCostInclGST}
                    onChange={(e) => handleInputChange('estimatedCostInclGST', e.target.value)}
                    placeholder="e.g., ₹59,00,000"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="capexCostInclGST">Ballpark Capex Cost incl. GST</Label>
                  <Input
                    id="capexCostInclGST"
                    value={formData.capexCostInclGST}
                    onChange={(e) => handleInputChange('capexCostInclGST', e.target.value)}
                    placeholder="e.g., ₹40,00,000"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="opexCostInclGST">Ballpark Opex Cost incl. GST</Label>
                  <Input
                    id="opexCostInclGST"
                    value={formData.opexCostInclGST}
                    onChange={(e) => handleInputChange('opexCostInclGST', e.target.value)}
                    placeholder="e.g., ₹19,00,000"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>

            {/* Approval Information Section */}
            <div>
              <h3 className="text-lg font-medium mb-4">Approval Information</h3>
              <Separator className="mb-4" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="proposedBy">Proposed By</Label>
                  <Input
                    id="proposedBy"
                    value={formData.proposedBy}
                    onChange={(e) => handleInputChange('proposedBy', e.target.value)}
                    placeholder="Enter proposer name"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recommendedBy">Recommended by</Label>
                  <Input
                    id="recommendedBy"
                    value={formData.recommendedBy}
                    onChange={(e) => handleInputChange('recommendedBy', e.target.value)}
                    placeholder="Enter recommender name"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="approvalAccordedBy">In-Principle Approval Accorded by</Label>
                  <Input
                    id="approvalAccordedBy"
                    value={formData.approvalAccordedBy}
                    onChange={(e) => handleInputChange('approvalAccordedBy', e.target.value)}
                    placeholder="Enter approver name"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label>In-Principle Approval Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.approvalDate ? formatDate(formData.approvalDate) : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.approvalDate || undefined}
                        onSelect={(date) => handleInputChange('approvalDate', date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>

            {/* Work Division Section */}
            <div>
              <h3 className="text-lg font-medium mb-4">Work Division</h3>
              <Separator className="mb-4" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="subDivisionBeforeAAES">No of Sub-Division of Main Work before AAES</Label>
                  <Input
                    id="subDivisionBeforeAAES"
                    value={formData.subDivisionBeforeAAES}
                    onChange={(e) => handleInputChange('subDivisionBeforeAAES', e.target.value)}
                    placeholder="Enter number"
                    type="number"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subDivisionAfterAAES">No of Sub-Division of Main Work after AAES</Label>
                  <Input
                    id="subDivisionAfterAAES"
                    value={formData.subDivisionAfterAAES}
                    onChange={(e) => handleInputChange('subDivisionAfterAAES', e.target.value)}
                    placeholder="Enter number"
                    type="number"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>

            {/* Procurement Details Section */}
            <div>
              <h3 className="text-lg font-medium mb-4">Procurement Details</h3>
              <Separator className="mb-4" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="modeOfProcurement">Mode of Procurement</Label>
                  <Select value={formData.modeOfProcurement} onValueChange={(value) => handleInputChange('modeOfProcurement', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gem">GEM</SelectItem>
                      <SelectItem value="cpp-portal">CPP Portal</SelectItem>
                      <SelectItem value="niq">NIQ</SelectItem>
                      <SelectItem value="spot-purchase">Spot Purchase</SelectItem>
                      <SelectItem value="negotiation-basis">Negotiation Basis</SelectItem>
                      <SelectItem value="annual-rate-contract">Annual Rate Contract</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="methodOfProcurement">Method of Procurement</Label>
                  <Select value={formData.methodOfProcurement} onValueChange={(value) => handleInputChange('methodOfProcurement', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="direct-purchase">Direct Purchase</SelectItem>
                      <SelectItem value="direct-purchase-comparison">Direct Purchase on Comparison Basis</SelectItem>
                      <SelectItem value="bidding">Bidding</SelectItem>
                      <SelectItem value="reverse-auction">Reverse Auction</SelectItem>
                      <SelectItem value="bid-followed-by-ra">Bid followed by RA</SelectItem>
                      <SelectItem value="pac-bidding">PAC Bidding</SelectItem>
                      <SelectItem value="pac-reverse-auction">PAC Reverse Auction</SelectItem>
                      <SelectItem value="pac-bidding-followed-by-ra">PAC Bidding followed by RA</SelectItem>
                      <SelectItem value="boq-bidding">BOQ Bidding</SelectItem>
                      <SelectItem value="custom-bidding">Custom bidding</SelectItem>
                      <SelectItem value="open-tender">Open Tender</SelectItem>
                      <SelectItem value="limited-tender">Limited Tender</SelectItem>
                      <SelectItem value="tender-cum-auction">Tender cum Auction</SelectItem>
                      <SelectItem value="quality-cum-cost-based">Quality cum cost based selection</SelectItem>
                      <SelectItem value="niq">NIQ</SelectItem>
                      <SelectItem value="spot-purchase">Spot Purchase</SelectItem>
                      <SelectItem value="negotiation-basis">Negotiation Basis</SelectItem>
                      <SelectItem value="annual-rate-contract">Annual Rate Contract</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emdExemptionType">EMD Exemption Type</Label>
                  <Select value={formData.emdExemptionType} onValueChange={(value) => handleInputChange('emdExemptionType', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select EMD type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="emd">EMD</SelectItem>
                      <SelectItem value="surety-bond">Surety Bond</SelectItem>
                      <SelectItem value="msme">MSME</SelectItem>
                      <SelectItem value="vendor-assessment">Vendor Assessment</SelectItem>
                      <SelectItem value="turnover-500cr">Turn Over more than 500 Cr</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Legacy Fields Section (for backward compatibility) */}
            <div>
              <h3 className="text-lg font-medium mb-4">Additional Project Details</h3>
              <Separator className="mb-4" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Planning">Planning</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="On Hold">On Hold</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                      <SelectItem value="Cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe the project goals and objectives"
                    rows={4}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6">
              <Button type="button" variant="outline" onClick={onCancel}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                <Save className="w-4 h-4 mr-2" />
                {isSubmitting 
                  ? (project ? 'Updating...' : 'Creating...') 
                  : (project ? 'Update Project' : 'Create Project')
                }
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}