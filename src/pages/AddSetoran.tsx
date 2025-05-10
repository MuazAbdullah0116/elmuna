
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Santri } from "@/types";
import { fetchSantriById, createSetoran, updateTotalHafalan } from "@/services/supabase";

interface SurahOption {
  value: string;
  label: string;
}

const AddSetoran = () => {
  const { santriId } = useParams<{ santriId: string }>();
  const [santri, setSantri] = useState<Santri | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Changed from hardcoded today's date to state with Date object
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [juz, setJuz] = useState("1");
  const [surah, setSurah] = useState("");
  const [startAyat, setStartAyat] = useState("");
  const [endAyat, setEndAyat] = useState("");
  const [kelancaran, setKelancaran] = useState([7]);
  const [tajwid, setTajwid] = useState([7]);
  const [tahsin, setTahsin] = useState([7]);
  const [notes, setNotes] = useState("");
  const [examiner, setExaminer] = useState("");
  
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Mock Surah list
  const surahOptions: SurahOption[] = [
    { value: "Al-Fatihah", label: "1. Al-Fatihah" },
    { value: "Al-Baqarah", label: "2. Al-Baqarah" },
    { value: "Ali 'Imran", label: "3. Ali 'Imran" },
    { value: "An-Nisa", label: "4. An-Nisa" },
    { value: "Al-Ma'idah", label: "5. Al-Ma'idah" },
    { value: "Al-An'am", label: "6. Al-An'am" },
    { value: "Al-A'raf", label: "7. Al-A'raf" },
    { value: "Al-Anfal", label: "8. Al-Anfal" },
    { value: "At-Taubah", label: "9. At-Taubah" },
    { value: "Yunus", label: "10. Yunus" },
    { value: "Hud", label: "11. Hud" },
    { value: "Yusuf", label: "12. Yusuf" },
    { value: "Ar-Ra'd", label: "13. Ar-Ra'd" },
    { value: "Ibrahim", label: "14. Ibrahim" },
    { value: "Al-Hijr", label: "15. Al-Hijr" },
    { value: "An-Nahl", label: "16. An-Nahl" },
    { value: "Al-Isra", label: "17. Al-Isra" },
    { value: "Al-Kahf", label: "18. Al-Kahf" },
    { value: "Maryam", label: "19. Maryam" }, 
    { value: "Taha", label: "20. Taha" },
    { value: "Al-Anbiya", label: "21. Al-Anbiya" },
    { value: "Al-Hajj", label: "22. Al-Hajj" },
    { value: "Al-Mu'minun", label: "23. Al-Mu'minun" },
    { value: "An-Nur", label: "24. An-Nur" },
    { value: "Al-Furqan", label: "25. Al-Furqan" },
    { value: "Asy-Syu'ara", label: "26. Asy-Syu'ara" },
    { value: "An-Naml", label: "27. An-Naml" },
    { value: "Al-Qasas", label: "28. Al-Qasas" },
    { value: "Al-Ankabut", label: "29. Al-Ankabut" },
    { value: "Ar-Rum", label: "30. Ar-Rum" },
    { value: "Luqman", label: "31. Luqman" },
    { value: "As-Sajdah", label: "32. As-Sajdah" },
    { value: "Al-Ahzab", label: "33. Al-Ahzab" },
    { value: "Saba", label: "34. Saba" },
    { value: "Fatir", label: "35. Fatir" },
    { value: "Ya-Sin", label: "36. Ya-Sin" },
    { value: "As-Saffat", label: "37. As-Saffat" },
    { value: "Sad", label: "38. Sad" },
    { value: "Az-Zumar", label: "39. Az-Zumar" },
    { value: "Gafir", label: "40. Gafir" },
    { value: "Fussilat", label: "41. Fussilat" },
    { value: "Asy-Syura", label: "42. Asy-Syura" },
    { value: "Az-Zukhruf", label: "43. Az-Zukhruf" },
    { value: "Ad-Dukhan", label: "44. Ad-Dukhan" },
    { value: "Al-Jasiyah", label: "45. Al-Jasiyah" },
    { value: "Al-Ahqaf", label: "46. Al-Ahqaf" },
    { value: "Muhammad", label: "47. Muhammad" },
    { value: "Al-Fath", label: "48. Al-Fath" },
    { value: "Al-Hujurat", label: "49. Al-Hujurat" },
    { value: "Qaf", label: "50. Qaf" },
    { value: "Az-Zariyat", label: "51. Az-Zariyat" },
    { value: "At-Tur", label: "52. At-Tur" },
    { value: "An-Najm", label: "53. An-Najm" },
    { value: "Al-Qamar", label: "54. Al-Qamar" },
    { value: "Ar-Rahman", label: "55. Ar-Rahman" },
    { value: "Al-Waqiah", label: "56. Al-Waqiah" },
    { value: "Al-Hadid", label: "57. Al-Hadid" },
    { value: "Al-Mujadilah", label: "58. Al-Mujadilah" },
    { value: "Al-Hasyr", label: "59. Al-Hasyr" },
    { value: "Al-Mumtahanah", label: "60. Al-Mumtahanah" },
    { value: "As-Saff", label: "61. As-Saff" },
    { value: "Al-Jumuah", label: "62. Al-Jumuah" },
    { value: "Al-Munafiqun", label: "63. Al-Munafiqun" },
    { value: "At-Tagabun", label: "64. At-Tagabun" },
    { value: "At-Talaq", label: "65. At-Talaq" },
    { value: "At-Tahrim", label: "66. At-Tahrim" },
    { value: "Al-Mulk", label: "67. Al-Mulk" },
    { value: "Al-Qalam", label: "68. Al-Qalam" },
    { value: "Al-Haqqah", label: "69. Al-Haqqah" },
    { value: "Al-Maarij", label: "70. Al-Maarij" },
    { value: "Nuh", label: "71. Nuh" },
    { value: "Al-Jinn", label: "72. Al-Jinn" },
    { value: "Al-Muzzammil", label: "73. Al-Muzzammil" },
    { value: "Al-Muddaththir", label: "74. Al-Muddaththir" },
    { value: "Al-Qiyamah", label: "75. Al-Qiyamah" },
    { value: "Al-Insan", label: "76. Al-Insan" },
    { value: "Al-Mursalat", label: "77. Al-Mursalat" },
    { value: "An-Naba", label: "78. An-Naba" },
    { value: "An-Nazi'at", label: "79. An-Nazi'at" },
    { value: "Abasa", label: "80. Abasa" },
    { value: "At-Takwir", label: "81. At-Takwir" },
    { value: "Al-Infitar", label: "82. Al-Infitar" },
    { value: "Al-Mutaffifin", label: "83. Al-Mutaffifin" },
    { value: "Al-Inshiqaq", label: "84. Al-Inshiqaq" },
    { value: "Al-Buruj", label: "85. Al-Buruj" },
    { value: "At-Tariq", label: "86. At-Tariq" },
    { value: "Al-A'la", label: "87. Al-A'la" },
    { value: "Al-Ghashiyah", label: "88. Al-Ghashiyah" },
    { value: "Al-Fajr", label: "89. Al-Fajr" },
    { value: "Al-Balad", label: "90. Al-Balad" },
    { value: "Ash-Shams", label: "91. Ash-Shams" },
    { value: "Al-Lail", label: "92. Al-Lail" },
    { value: "Ad-Duha", label: "93. Ad-Duha" },
    { value: "Inshirah", label: "94. Inshirah" },
    { value: "At-Tin", label: "95. At-Tin" },
    { value: "Al-Alaq", label: "96. Al-Alaq" },
    { value: "Al-Qadr", label: "97. Al-Qadr" },
    { value: "Al-Bayyina", label: "98. Al-Bayyina" },
    { value: "Az-Zalzalah", label: "99. Az-Zalzalah" },
    { value: "Al-Adiyat", label: "100. Al-Adiyat" },
    { value: "Al-Qari'ah", label: "101. Al-Qari'ah" },
    { value: "At-Takatsur", label: "102. At-Takatsur" },
    { value: "Al-Asr", label: "103. Al-Asr" },
    { value: "Al-Humazah", label: "104. Al-Humazah" },
    { value: "Al-Fil", label: "105. Al-Fil" },
    { value: "Quraish", label: "106. Quraish" },
    { value: "Al-Ma'un", label: "107. Al-Ma'un" },
    { value: "Al-Kausar", label: "108. Al-Kausar" },
    { value: "Al-Kafirun", label: "109. Al-Kafirun" },
    { value: "An-Nasr", label: "110. An-Nasr" },
    { value: "Al-Lahab", label: "111. Al-Lahab" },
    { value: "Al-Ikhlas", label: "112. Al-Ikhlas" },
    { value: "Al-Falaq", label: "113. Al-Falaq" },
    { value: "An-Nas", label: "114. An-Nas" },
  ];

  useEffect(() => {
    const fetchSantri = async () => {
      if (!santriId) return;
      
      try {
        const data = await fetchSantriById(santriId);
        if (data) {
          setSantri(data);
        } else {
          toast({
            title: "Error",
            description: "Santri tidak ditemukan",
            variant: "destructive",
          });
          navigate("/dashboard");
        }
      } catch (error) {
        console.error("Error fetching santri:", error);
        toast({
          title: "Error",
          description: "Gagal memuat data santri",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSantri();
  }, [santriId, navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!santriId || !surah || !startAyat || !endAyat || !examiner) {
      toast({
        title: "Data tidak lengkap",
        description: "Mohon lengkapi semua field",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await createSetoran({
        santri_id: santriId,
        tanggal: format(selectedDate, 'yyyy-MM-dd'),
        juz: parseInt(juz),
        surat: surah,
        awal_ayat: parseInt(startAyat),
        akhir_ayat: parseInt(endAyat),
        kelancaran: kelancaran[0],
        tajwid: tajwid[0],
        tahsin: tahsin[0],
        catatan: notes,
        diuji_oleh: examiner,
      });
      
      // Update total hafalan count for the santri
      await updateTotalHafalan(santriId);
      
      toast({
        title: "Berhasil",
        description: "Data setoran berhasil ditambahkan",
      });
      
      navigate("/dashboard");
    } catch (error) {
      console.error("Error adding setoran:", error);
      toast({
        title: "Error",
        description: "Gagal menambahkan data setoran",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <Card className="islamic-card">
        <CardHeader>
          <CardTitle>Tambah Setoran</CardTitle>
          <CardDescription>
            {santri ? `Tambah setoran untuk ${santri.nama}` : "Tambah data setoran baru"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="date">Tanggal</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                    id="date"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(selectedDate, "dd MMMM yyyy")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="juz">Juz</Label>
                <Select
                  value={juz}
                  onValueChange={setJuz}
                  required
                >
                  <SelectTrigger id="juz">
                    <SelectValue placeholder="Pilih juz" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 30 }, (_, i) => i + 1).map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        Juz {num}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="surah">Surat</Label>
                <Select
                  value={surah}
                  onValueChange={setSurah}
                  required
                >
                  <SelectTrigger id="surah">
                    <SelectValue placeholder="Pilih surat" />
                  </SelectTrigger>
                  <SelectContent>
                    {surahOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startAyat">Awal Ayat</Label>
                <Input
                  id="startAyat"
                  type="number"
                  min="1"
                  placeholder="Awal ayat"
                  value={startAyat}
                  onChange={(e) => setStartAyat(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="endAyat">Akhir Ayat</Label>
                <Input
                  id="endAyat"
                  type="number"
                  min="1"
                  placeholder="Akhir ayat"
                  value={endAyat}
                  onChange={(e) => setEndAyat(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="kelancaran">Nilai Kelancaran</Label>
                <span className="text-sm font-medium">{kelancaran[0]}/10</span>
              </div>
              <Slider
                id="kelancaran"
                min={1}
                max={10}
                step={1}
                value={kelancaran}
                onValueChange={setKelancaran}
                className="py-2"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="tajwid">Nilai Tajwid</Label>
                <span className="text-sm font-medium">{tajwid[0]}/10</span>
              </div>
              <Slider
                id="tajwid"
                min={1}
                max={10}
                step={1}
                value={tajwid}
                onValueChange={setTajwid}
                className="py-2"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="tahsin">Nilai Tahsin</Label>
                <span className="text-sm font-medium">{tahsin[0]}/10</span>
              </div>
              <Slider
                id="tahsin"
                min={1}
                max={10}
                step={1}
                value={tahsin}
                onValueChange={setTahsin}
                className="py-2"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Catatan</Label>
              <Textarea
                id="notes"
                placeholder="Tambahkan catatan (opsional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[80px]"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="examiner">Diuji Oleh</Label>
              <Input
                id="examiner"
                placeholder="Nama penguji"
                value={examiner}
                onChange={(e) => setExaminer(e.target.value)}
                required
              />
            </div>
            
            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/dashboard")}
                className="flex-1"
              >
                Batal
              </Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? "Menyimpan..." : "Simpan"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddSetoran;
