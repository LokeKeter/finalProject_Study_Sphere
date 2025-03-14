import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectItem } from "@/components/ui/select";
import { toast } from "react-hot-toast";

export default function ParentUserProfile() {
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [relationship, setRelationship] = useState("");
  const [email, setEmail] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);

  const handleSave = () => {
    if (!email.includes("@") || !email.includes(".")) {
      toast.error("Please enter a valid email address.");
      return;
    }
    if (!phoneNumber.match(/^\+\d{3}-\d{3}-\d{4}$/)) {
      toast.error("Please enter a valid phone number format: +XXX-XXX-XXXX");
      return;
    }
    toast.success("Profile saved successfully!");
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-semibold mb-4">Parent User Profile</h2>

      <div className="mb-4">
        <Label>Full Name</Label>
        <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
      </div>

      <div className="mb-4">
        <Label>Phone Number</Label>
        <Input
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          placeholder="+XXX-XXX-XXXX"
        />
      </div>

      <div className="mb-4">
        <Label>Email</Label>
        <Input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          required
        />
      </div>

      <div className="mb-4">
        <Label>Relationship</Label>
        <Select value={relationship} onChange={setRelationship}>
          <SelectItem value="Mother">Mother</SelectItem>
          <SelectItem value="Father">Father</SelectItem>
          <SelectItem value="Guardian">Guardian</SelectItem>
        </Select>
      </div>

      <div className="mb-4">
        <Label>Upload Profile Picture</Label>
        <Input type="file" accept="image/jpeg, image/png" onChange={(e) => setProfilePicture(e.target.files[0])} />
      </div>

      <div className="flex gap-4 mt-4">
        <Button className="bg-black text-white" onClick={handleSave}>Save Changes</Button>
        <Button className="bg-gray-400" onClick={() => window.location.reload()}>Cancel</Button>
      </div>
    </div>
  );
}
