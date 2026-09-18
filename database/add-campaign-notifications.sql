-- ============================================================
-- Add campaign notifications for display in the notification system
-- Run in: Supabase Dashboard -> SQL Editor -> New Query
-- ============================================================

DO $$
DECLARE
  admin_id UUID;
  fire_safety_id UUID;
  weather_advisory_id UUID;
  clean_up_id UUID;
  flood_evacuation_id UUID;
  road_safety_id UUID;
  anti_drug_id UUID;
BEGIN
  -- Get the first admin user's ID
  SELECT id INTO admin_id FROM public.users WHERE role = 'admin' LIMIT 1;
  
  -- If no admin found, use any user
  IF admin_id IS NULL THEN
    SELECT id INTO admin_id FROM public.users LIMIT 1;
  END IF;

  -- Insert Fire Safety Campaign
  INSERT INTO public.campaigns (title, description, campaign_type, status, created_by, created_at, updated_at)
  VALUES
  (
    'Fire Safety Advisory',
    E'🔥 FIRE SAFETY ADVISORY\n\nATTENTION Barangay 178 Residents:\n\nFire prevention is everyone''s responsibility. Please observe these safety measures:\n\n• Ensure fire extinguishers are accessible and functional\n• Check electrical wiring and avoid overloading outlets\n• Never leave cooking unattended\n• Properly dispose of cigarette butts and matches\n• Keep flammable materials away from heat sources\n\nIn case of fire:\n1. Call emergency services immediately\n2. Evacuate using the nearest exit\n3. Do not use elevators during fire emergencies\n4. Assist neighbors who may need help\n\nReport fire hazards to the Barangay Fire Safety Officer.\n\nTogether, we can keep our community safe!',
    'safety',
    'published',
    admin_id,
    NOW(),
    NOW()
  )
  ON CONFLICT DO NOTHING
  RETURNING id INTO fire_safety_id;

  -- If insert didn't return ID (conflict), try to find existing
  IF fire_safety_id IS NULL THEN
    SELECT id INTO fire_safety_id FROM public.campaigns WHERE title = 'Fire Safety Advisory' LIMIT 1;
  END IF;

  -- Insert Weather Advisory Campaign
  INSERT INTO public.campaigns (title, description, campaign_type, status, created_by, created_at, updated_at)
  VALUES
  (
    'Weather Advisory',
    E'🌧️ WEATHER ADVISORY\n\nATTENTION Barangay 178 Residents:\n\nDue to the heavy rainfall forecast in our area, please take the following precautions:\n\n• Monitor weather updates through official channels\n• Prepare emergency kits with essential supplies\n• Avoid crossing flooded streets and waterways\n• Secure loose items around your property\n• Stay indoors unless absolutely necessary\n\nResidents in low-lying areas (Puroks 1, 3, and 5) should be especially vigilant and consider temporary evacuation if water levels rise.\n\nFor emergency assistance, contact:\n📞 Barangay Hotline: 123-4567\n📍 Barangay Hall: Open 24/7\n\nLet us look out for one another. Stay safe, Barangay 178!',
    'emergency',
    'published',
    admin_id,
    NOW(),
    NOW()
  )
  ON CONFLICT DO NOTHING
  RETURNING id INTO weather_advisory_id;

  IF weather_advisory_id IS NULL THEN
    SELECT id INTO weather_advisory_id FROM public.campaigns WHERE title = 'Weather Advisory' LIMIT 1;
  END IF;

  -- Insert Community Clean-Up Drive Campaign
  INSERT INTO public.campaigns (title, description, campaign_type, status, created_by, created_at, updated_at)
  VALUES
  (
    'Community Clean-Up Drive',
    E'🧹 CLEAN-UP DRIVE ADVISORY\n\nATTENTION Barangay 178 Residents:\n\nLet''s keep our community clean and green! Join our monthly clean-up activities:\n\n📅 Every last Saturday of the month, 7:00 AM\n📍 Meeting Point: Barangay Hall\n\nWhat to bring:\n• Gloves and face masks\n• Rakes and brooms (if available)\n• Reusable bags for waste\n\nGuidelines:\n• Segregate waste properly: biodegradable, non-biodegradable, and recyclable\n• Report illegal dumping sites to the Barangay Environmental Officer\n• Maintain cleanliness in front of your homes daily\n\nA clean environment is a healthy environment. Let''s work together for a greener Barangay 178!',
    'environment',
    'published',
    admin_id,
    NOW(),
    NOW()
  )
  ON CONFLICT DO NOTHING
  RETURNING id INTO clean_up_id;

  IF clean_up_id IS NULL THEN
    SELECT id INTO clean_up_id FROM public.campaigns WHERE title = 'Community Clean-Up Drive' LIMIT 1;
  END IF;

  -- Insert Flood Evacuation Route Advisory Campaign
  INSERT INTO public.campaigns (title, description, campaign_type, status, created_by, created_at, updated_at)
  VALUES
  (
    'Flood Evacuation Route Advisory',
    E'🌊 FLOOD EVACUATION ADVISORY\n\nATTENTION Barangay 178 Residents:\n\nDue to the rainy season, please be aware of the following evacuation routes:\n\nEvacuation Centers:\n📍 Barangay 178 Hall — Primary center\n📍 Camarin Elementary School — Secondary center\n\nPrecautions:\n• Monitor weather updates through PAGASA\n• Prepare emergency kits with food, water, and medicine\n• Avoid crossing flooded streets and waterways\n• Secure important documents in waterproof containers\n• Residents in low-lying areas (Puroks 1, 3, 5) should evacuate early\n\nFor emergency assistance:\n📞 Barangay Emergency Hotline: 123-4567\n📍 Barangay Hall: Open 24/7 during emergencies\n\nLet us look out for one another. Stay safe, Barangay 178!',
    'emergency',
    'published',
    admin_id,
    NOW(),
    NOW()
  )
  ON CONFLICT DO NOTHING
  RETURNING id INTO flood_evacuation_id;

  IF flood_evacuation_id IS NULL THEN
    SELECT id INTO flood_evacuation_id FROM public.campaigns WHERE title = 'Flood Evacuation Route Advisory' LIMIT 1;
  END IF;

  -- Insert Road Safety Awareness Campaign
  INSERT INTO public.campaigns (title, description, campaign_type, status, created_by, created_at, updated_at)
  VALUES
  (
    'Road Safety Awareness Campaign',
    E'🚗 ROAD SAFETY ADVISORY\n\nATTENTION Barangay 178 Residents:\n\nYour safety on the road is our priority. Please observe the following:\n\nFor Drivers:\n• Always wear your seatbelt\n• Never use your phone while driving\n• Observe speed limits in residential areas (30 kph)\n• Do not drink and drive\n• Yield to pedestrians at crosswalks\n\nFor Pedestrians:\n• Use designated crosswalks only\n• Look both ways before crossing\n• Do not jaywalk or cross when the light is red\n• Be visible at night — wear bright clothing\n\nFor Motorcycle Riders:\n• Always wear a helmet (both rider and passenger)\n• Avoid weaving through traffic\n\nReport reckless driving to PNP Traffic: 117\n\nLet''s make our roads safer for everyone in Barangay 178!',
    'safety',
    'published',
    admin_id,
    NOW(),
    NOW()
  )
  ON CONFLICT DO NOTHING
  RETURNING id INTO road_safety_id;

  IF road_safety_id IS NULL THEN
    SELECT id INTO road_safety_id FROM public.campaigns WHERE title = 'Road Safety Awareness Campaign' LIMIT 1;
  END IF;

  -- Insert Anti-Drug Awareness Program Campaign
  INSERT INTO public.campaigns (title, description, campaign_type, status, created_by, created_at, updated_at)
  VALUES
  (
    'Anti-Drug Awareness Program',
    E'🚫 ANTI-DRUG AWARENESS ADVISORY\n\nATTENTION Barangay 178 Residents:\n\nOur barangay is committed to being drug-free. Here is what you need to know:\n\nDangers of Drug Abuse:\n• Destroys health and family relationships\n• Leads to criminal behavior and imprisonment\n• Affects the entire community''s safety\n\nWhat You Can Do:\n• Report drug activities anonymously to the Barangay Anti-Drug Abuse Council (BADAC)\n• Support community rehabilitation programs\n• Educate your children about the dangers of drugs\n• Participate in Barangay Drug Clearing activities\n\nSupport Services:\n📍 BADAC Office: Barangay Hall, Room 2\n📞 Anonymous Hotline: 0917-DRUG-FREE\n\nTogether, we build a drug-free Barangay 178. Mabuhay!',
    'community',
    'published',
    admin_id,
    NOW(),
    NOW()
  )
  ON CONFLICT DO NOTHING
  RETURNING id INTO anti_drug_id;

  IF anti_drug_id IS NULL THEN
    SELECT id INTO anti_drug_id FROM public.campaigns WHERE title = 'Anti-Drug Awareness Program' LIMIT 1;
  END IF;

  -- Create notifications for all users for these campaigns
  -- Mark them as read initially so they don't appear as new notifications
  INSERT INTO public.notifications (recipient_id, campaign_id, title, message, type, status, read_at, created_at)
  SELECT 
    u.id as recipient_id,
    c.id as campaign_id,
    'Campaign: ' || c.title as title,
    SUBSTRING(c.description, 1, 200) || '...' as message,
    'campaign' as type,
    'read' as status,
    NOW() as read_at,
    NOW() as created_at
  FROM public.campaigns c
  CROSS JOIN public.users u
  WHERE c.id IN (fire_safety_id, weather_advisory_id, clean_up_id, flood_evacuation_id, road_safety_id, anti_drug_id)
  AND u.role IN ('staff', 'citizen', 'public')
  AND NOT EXISTS (
    SELECT 1 FROM public.notifications n 
    WHERE n.campaign_id = c.id 
    AND n.recipient_id = u.id
  );

  RAISE NOTICE 'Successfully added campaigns and notifications!';
END $$;

-- Verify the result
SELECT 
  c.id, 
  c.title, 
  c.status, 
  c.campaign_type,
  COUNT(n.id) as notification_count
FROM public.campaigns c
LEFT JOIN public.notifications n ON c.id = n.campaign_id
WHERE c.title IN (
  'Fire Safety Advisory',
  'Weather Advisory', 
  'Community Clean-Up Drive',
  'Flood Evacuation Route Advisory',
  'Road Safety Awareness Campaign',
  'Anti-Drug Awareness Program'
)
GROUP BY c.id, c.title, c.status, c.campaign_type
ORDER BY c.created_at DESC;
