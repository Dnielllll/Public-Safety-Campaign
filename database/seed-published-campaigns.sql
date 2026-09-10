-- ============================================================
-- SEED: Add sample published campaigns to show in public portal
-- Run in: Supabase Dashboard -> SQL Editor -> New Query
-- ============================================================

DO $$
DECLARE
  admin_id UUID;
BEGIN
  -- Get the first admin user's ID
  SELECT id INTO admin_id FROM public.users WHERE role = 'admin' LIMIT 1;
  
  -- If no admin found, use any user
  IF admin_id IS NULL THEN
    SELECT id INTO admin_id FROM public.users LIMIT 1;
  END IF;

  -- Insert published campaigns using only ALLOWED campaign_type values:
  -- 'safety', 'health', 'environment', 'emergency', 'community'
  INSERT INTO public.campaigns (title, description, campaign_type, status, created_by, created_at, updated_at)
  VALUES
  (
    'Fire Safety Reminders for the Dry Season',
    E'🔥 FIRE SAFETY ADVISORY\n\nATTENTION Barangay 178 Residents:\n\nFire prevention is everyone''s responsibility. Please observe these safety measures:\n\n• Ensure fire extinguishers are accessible and functional\n• Check electrical wiring and avoid overloading outlets\n• Never leave cooking unattended\n• Properly dispose of cigarette butts and matches\n• Keep flammable materials away from heat sources\n\nIn case of fire:\n1. Call emergency services immediately (Bureau of Fire Protection: 160)\n2. Evacuate using the nearest exit\n3. Assist neighbors who may need help\n\nReport fire hazards to the Barangay Fire Safety Officer.\n\nTogether, we can keep Barangay 178 safe!',
    'safety',
    'published',
    admin_id,
    NOW(),
    NOW()
  ),
  (
    'Flood Evacuation Route Advisory',
    E'🌧️ FLOOD EVACUATION ADVISORY\n\nATTENTION Barangay 178 Residents:\n\nDue to the rainy season, please be aware of the following evacuation routes:\n\nEvacuation Centers:\n📍 Barangay 178 Hall — Primary center\n📍 Camarin Elementary School — Secondary center\n\nPrecautions:\n• Monitor weather updates through PAGASA\n• Prepare emergency kits with food, water, and medicine\n• Avoid crossing flooded streets and waterways\n• Secure important documents in waterproof containers\n• Residents in low-lying areas (Puroks 1, 3, 5) should evacuate early\n\nFor emergency assistance:\n📞 Barangay Emergency Hotline: 123-4567\n📍 Barangay Hall: Open 24/7 during emergencies\n\nLet us look out for one another. Stay safe, Barangay 178!',
    'emergency',
    'published',
    admin_id,
    NOW(),
    NOW()
  ),
  (
    'Dengue Prevention Campaign',
    E'🏥 DENGUE PREVENTION ADVISORY\n\nATTENTION Barangay 178 Residents:\n\nTo protect our community from dengue fever, please practice the 4S strategy:\n\n✅ Search and Destroy — Remove all mosquito breeding sites\n✅ Self-protection — Use mosquito repellent and wear protective clothing\n✅ Seek early consultation — Visit the health center at the first sign of fever\n✅ Say no to indiscriminate fogging\n\nPrevention Tips:\n• Cover water containers tightly\n• Change water in flower vases every week\n• Properly dispose of old tires, cans, and bottles\n• Keep surroundings clean and clutter-free\n\nHealth Services:\n📍 Barangay 178 Health Center: Mon–Fri, 8AM–5PM\n📞 Health Hotline: 987-6543\n\nFree dengue testing available at the Health Center every Tuesday.\n\nYour health is our priority. Stay healthy, Barangay 178!',
    'health',
    'published',
    admin_id,
    NOW(),
    NOW()
  ),
  (
    'Community Clean-Up Drive',
    E'🧹 CLEAN-UP DRIVE ADVISORY\n\nATTENTION Barangay 178 Residents:\n\nLet''s keep our community clean and green! Join our monthly clean-up activities:\n\n📅 Every last Saturday of the month, 7:00 AM\n📍 Meeting Point: Barangay Hall\n\nWhat to bring:\n• Gloves and face masks\n• Rakes and brooms (if available)\n• Reusable bags for waste\n\nGuidelines:\n• Segregate waste properly: biodegradable, non-biodegradable, and recyclable\n• Report illegal dumping sites to the Barangay Environmental Officer\n• Maintain cleanliness in front of your homes daily\n\nA clean environment is a healthy environment. Let''s work together for a greener Barangay 178!',
    'environment',
    'published',
    admin_id,
    NOW(),
    NOW()
  ),
  (
    'Anti-Drug Awareness Program',
    E'🚫 ANTI-DRUG AWARENESS ADVISORY\n\nATTENTION Barangay 178 Residents:\n\nOur barangay is committed to being drug-free. Here is what you need to know:\n\nDangers of Drug Abuse:\n• Destroys health and family relationships\n• Leads to criminal behavior and imprisonment\n• Affects the entire community''s safety\n\nWhat You Can Do:\n• Report drug activities anonymously to the Barangay Anti-Drug Abuse Council (BADAC)\n• Support community rehabilitation programs\n• Educate your children about the dangers of drugs\n• Participate in Barangay Drug Clearing activities\n\nSupport Services:\n📍 BADAC Office: Barangay Hall, Room 2\n📞 Anonymous Hotline: 0917-DRUG-FREE\n\nTogether, we build a drug-free Barangay 178. Mabuhay!',
    'community',
    'published',
    admin_id,
    NOW(),
    NOW()
  ),
  (
    'Road Safety Awareness Campaign',
    E'🚗 ROAD SAFETY ADVISORY\n\nATTENTION Barangay 178 Residents:\n\nYour safety on the road is our priority. Please observe the following:\n\nFor Drivers:\n• Always wear your seatbelt\n• Never use your phone while driving\n• Observe speed limits in residential areas (30 kph)\n• Do not drink and drive\n• Yield to pedestrians at crosswalks\n\nFor Pedestrians:\n• Use designated crosswalks only\n• Look both ways before crossing\n• Do not jaywalk or cross when the light is red\n• Be visible at night — wear bright clothing\n\nFor Motorcycle Riders:\n• Always wear a helmet (both rider and passenger)\n• Avoid weaving through traffic\n\nReport reckless driving to PNP Traffic: 117\n\nLet''s make our roads safer for everyone in Barangay 178!',
    'safety',
    'published',
    admin_id,
    NOW(),
    NOW()
  );

  RAISE NOTICE 'Successfully inserted published campaigns!';
END $$;

-- Verify the result
SELECT id, title, status, campaign_type FROM public.campaigns WHERE status = 'published' ORDER BY created_at DESC;
